const fs = require("fs");
const path = require("path");
const axios = require("axios");
const yts = require("yt-search");

const isCreditValid = () => {
  const encoded = "VXphaXIgUmFqcHV0IE10eA=="; // Base64 encoded original credits
  return Buffer.from(encoded, "base64").toString("utf-8");
};

module.exports.config = {
  name: "song",
  hasPermission: 0,
  version: "1.0.1",
  description: "Download YouTube audio (under 25MB) ya sirf link do",
  credits: isCreditValid(),
  usePrefix: false,
  cooldowns: 10,
  commandCategory: "Utility"
};

module.exports.run = async function ({ api, event, args }) {
  if (module.exports.config.credits !== isCreditValid()) {
    await api.sendMessage(
      "❌ | Yeh command choron ke liye nahi hai!\n\nTumne credits change karne ki koshish ki hai.\n\nScript band ki ja rahi hai...",
      event.threadID
    );
    process.exit(1);
    return;
  }

  if (!args[0]) {
    return api.sendMessage("❌ | Barah-e-karam ek gane ka naam darj karein!", event.threadID);
  }

  try {
    const query = args.join(" ");
    const findingMessage = await api.sendMessage(`🔍 | "${query}" talash kiya ja raha hai...`, event.threadID);

    const searchResults = await yts(query);
    const firstResult = searchResults.videos[0];

    if (!firstResult) {
      await api.sendMessage(`❌ | "${query}" ke liye koi nateeja nahi mila.`, event.threadID);
      return;
    }

    const { title, url } = firstResult;
    await api.editMessage(`⏳ | "${title}" ka audio hasil kiya ja raha hai...`, findingMessage.messageID);

    const apiUrl = `https://fast-youtube-api-uzair.onrender.com/api/video?q=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);
    const downloadUrl = response.data?.audio;

    if (!downloadUrl) {
      await api.sendMessage(`❌ | "${title}" ka audio link nahi mila.`, event.threadID);
      return;
    }

    const filePath = path.resolve(__dirname, "cache", `${Date.now()}-${title}.mp3`);

    const audioResponse = await axios.get(downloadUrl, {
      responseType: "stream",
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const fileStream = fs.createWriteStream(filePath);
    audioResponse.data.pipe(fileStream);

    fileStream.on("finish", async () => {
      const stats = fs.statSync(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);

      if (fileSizeInMB > 25) {
        await api.sendMessage(`❌ | "${title}" file ${fileSizeInMB.toFixed(2)}MB hai, jo 25MB se bari hai.\n📥 Link: ${downloadUrl}`, event.threadID);
        fs.unlinkSync(filePath);
        return;
      }

      await api.sendMessage({
        body: `🎵 | Aap ka audio "${title}" download ho gaya hai!`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID);

      fs.unlinkSync(filePath);
      api.unsendMessage(findingMessage.messageID);
    });

    audioResponse.data.on("error", async (error) => {
      console.error(error);
      await api.sendMessage(`❌ | Audio download karne mein masla hua: ${error.message}`, event.threadID);
      fs.unlinkSync(filePath);
    });

  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    await api.sendMessage(`❌ | Audio hasil karne mein masla hua: ${error.message}`, event.threadID);
  }
};