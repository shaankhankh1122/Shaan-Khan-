const axios = require("axios");
const fs = require('fs');

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/uzair1267/Ghumname-api-ytdl/main/baseApiUrl.json"
  );
  return base.data.api;
};

module.exports.config = {
  name: "sing",
  version: "2.1.0",
  aliases: ["music", "play"],
  credits: "Uzair Modified",
  countDown: 5,
  hasPermssion: 0,
  description: "Download audio from YouTube",
  category: "media",
  usePrefix: true,
  prefix: true,
  usages: "{pn} <song name | song link>\nExample:\n{pn} chipi chipi chapa chapa"
};

module.exports.run = async ({ api, args, event }) => {
  const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
  let videoID;
  const urlYtb = checkurl.test(args[0]);

  if (urlYtb) {
    const match = args[0].match(checkurl);
    videoID = match ? match[1] : null;
    const { data: { title, downloadLink } } = await axios.get(
      `${await baseApiUrl()}/ytDl3?link=${videoID}&format=mp3`
    );
    return api.sendMessage({
      body: title,
      attachment: await downloadFile(downloadLink, 'audio.mp3')
    }, event.threadID, () => fs.unlinkSync('audio.mp3'), event.messageID);
  }

  const keyWord = args.join(" ").replace("?feature=share", "");
  const maxResults = 6;
  let result;

  try {
    result = (await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${keyWord}`)).data.slice(0, maxResults);
  } catch (err) {
    return api.sendMessage("❌ Error: " + err.message, event.threadID, event.messageID);
  }

  if (result.length === 0)
    return api.sendMessage("⭕ No result found for: " + keyWord, event.threadID, event.messageID);

  let msg = "";
  let i = 1;
  const thumbnails = [];

  for (const info of result) {
    thumbnails.push(streamImage(info.thumbnail, 'thumb.jpg'));
    msg += `${i++}. ${info.title}\n⏱️ Time: ${info.time}\n📺 Channel: ${info.channel.name}\n\n`;
  }

  api.sendMessage({
    body: msg + "Reply with the number of the song you want.",
    attachment: await Promise.all(thumbnails)
  }, event.threadID, (err, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: event.senderID,
      result
    });
  }, event.messageID);
};

module.exports.handleReply = async ({ event, api, handleReply }) => {
  try {
    const { result } = handleReply;
    const choice = parseInt(event.body);

    if (!isNaN(choice) && choice <= result.length && choice > 0) {
      const infoChoice = result[choice - 1];
      const idvideo = infoChoice.id;
      const { data: { title, downloadLink, quality } } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${idvideo}&format=mp3`);

      await api.unsendMessage(handleReply.messageID);

      await api.sendMessage({
        body: `🎵 Title: ${title}\n🎧 Quality: ${quality}`,
        attachment: await downloadFile(downloadLink, 'audio.mp3')
      }, event.threadID, () => fs.unlinkSync('audio.mp3'), event.messageID);
    } else {
      api.sendMessage("❌ Invalid number! Choose from 1 to 6.", event.threadID, event.messageID);
    }
  } catch (error) {
    console.log(error);
    api.sendMessage("⭕ Sorry, audio size must be under 26MB", event.threadID, event.messageID);
  }
};

async function downloadFile(url, pathName) {
  const response = (await axios.get(url, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(pathName, Buffer.from(response));
  return fs.createReadStream(pathName);
}

async function streamImage(url, pathName) {
  const response = await axios.get(url, { responseType: "stream" });
  response.data.path = pathName;
  return response.data;
}