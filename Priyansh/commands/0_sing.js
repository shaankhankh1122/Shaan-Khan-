const axios = require("axios");
const fs = require("fs");

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/uzair1267/uzair-music-song/main/baseApiUrl.json"
  );
  return base.data.api;
};

module.exports.config = {
  name: "sing",
  version: "2.1.0",
  aliases: ["music", "play"],
  credits: "SHAAN UZIAR (Fixed by ChatGPT)",
  countDown: 5,
  hasPermssion: 0,
  description: "Download audio from YouTube",
  category: "media",
  commandCategory: "media",
  usePrefix: true,
  prefix: true,
  usages: "{pn} [<song name>|<song link>]:\n   Example:\n{pn} chipi chipi chapa chapa"
};

module.exports.run = async ({ api, args, event }) => {
  const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
  let input = args[0];

  // ✅ Convert Shorts URL to Watch URL
  if (input?.includes("youtube.com/shorts/")) {
    input = input.replace("youtube.com/shorts/", "youtube.com/watch?v=");
  }

  const urlYtb = checkurl.test(input);
  let videoID;

  if (urlYtb) {
    const match = input.match(checkurl);
    videoID = match ? match[1] : null;

    try {
      const { data: { title, downloadLink } } = await axios.get(
        `${await baseApiUrl()}/ytDl3?link=${videoID}&format=mp3`
      );

      return api.sendMessage(
        {
          body: title,
          attachment: await dipto(downloadLink, "audio.mp3")
        },
        event.threadID,
        () => fs.unlinkSync("audio.mp3"),
        event.messageID
      );
    } catch (err) {
      console.error("Error in direct link download:", err);
      return api.sendMessage("❌ Failed to download from YouTube link.", event.threadID, event.messageID);
    }
  }

  // 🔍 Search flow
  let keyWord = args.join(" ");
  keyWord = keyWord.includes("?feature=share") ? keyWord.replace("?feature=share", "") : keyWord;
  const maxResults = 6;
  let result;

  try {
    result = (await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${keyWord}`)).data.slice(0, maxResults);
  } catch (err) {
    return api.sendMessage("❌ An error occurred while searching: " + err.message, event.threadID, event.messageID);
  }

  if (result.length === 0)
    return api.sendMessage("⭕ No search results match the keyword: " + keyWord, event.threadID, event.messageID);

  let msg = "";
  let i = 1;
  const thumbnails = [];

  for (const info of result) {
    thumbnails.push(diptoSt(info.thumbnail, "photo.jpg"));
    msg += `${i++}. ${info.title}\nTime: ${info.time}\nChannel: ${info.channel.name}\n\n`;
  }

  api.sendMessage(
    {
      body: msg + "Reply to this message with a number to select the song.",
      attachment: await Promise.all(thumbnails)
    },
    event.threadID,
    (err, info) => {
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: event.senderID,
        result
      });
    },
    event.messageID
  );
};

module.exports.handleReply = async ({ event, api, handleReply }) => {
  try {
    const { result } = handleReply;
    const choice = parseInt(event.body);

    if (!isNaN(choice) && choice <= result.length && choice > 0) {
      const infoChoice = result[choice - 1];
      const idvideo = infoChoice.id;

      const { data: { title, downloadLink, quality } } = await axios.get(
        `${await baseApiUrl()}/ytDl3?link=${idvideo}&format=mp3`
      );

      await api.unsendMessage(handleReply.messageID);

      await api.sendMessage(
        {
          body: `• Title: ${title}\n• Quality: ${quality}`,
          attachment: await dipto(downloadLink, "audio.mp3")
        },
        event.threadID,
        () => fs.unlinkSync("audio.mp3"),
        event.messageID
      );
    } else {
      api.sendMessage("❌ Invalid choice. Please enter a number between 1 and 6.", event.threadID, event.messageID);
    }
  } catch (error) {
    console.error("Download error:", error);
    api.sendMessage("❌ Failed to download the audio. Please try again or check logs.", event.threadID, event.messageID);
  }
};

async function dipto(url, pathName) {
  try {
    console.log("Downloading from:", url);
    const response = (await axios.get(url, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathName, Buffer.from(response));
    return fs.createReadStream(pathName);
  } catch (err) {
    console.error("dipto() error:", err);
    throw err;
  }
}

async function diptoSt(url, pathName) {
  try {
    const response = await axios.get(url, { responseType: "stream" });
    response.data.path = pathName;
    return response.data;
  } catch (err) {
    console.error("diptoSt() error:", err);
    throw err;
  }
}