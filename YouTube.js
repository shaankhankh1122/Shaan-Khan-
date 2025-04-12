const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "youtube",
  hasPermission: 0,
  version: "1.0.1",
  description: "Download normal YouTube video via link",
  credits: "SHANKAR",
  usePrefix: false,
  commandCategory: "Utility"
};

module.exports.handleEvent = async function ({ api, event }) {
  const message = event.body;

  // Match normal YouTube video link (not shorts)
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = message.match(youtubeRegex);

  if (match) {
    const url = match[0];

    try {
      const findingMessage = await api.sendMessage(`⏳ | वीडियो डाउनलोड लिंक प्राप्त किया जा रहा है...`, event.threadID);

      const apiUrl = `https://mr-prince-malhotra-ytdl.vercel.app/video?url=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl);
      const data = response.data?.data;

      if (!data || !data.download) {
        await api.sendMessage(`❌ | वीडियो के लिए कोई डाउनलोड लिंक नहीं मिला।`, event.threadID);
        return;
      }

      const downloadUrl = data.download;
      const title = data.title || `YouTube-Video-${Date.now()}`;
      const filePath = path.resolve(__dirname, "cache", `${Date.now()}-${title}.mp4`);

      const videoResponse = await axios.get(downloadUrl, {
        responseType: "stream",
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      const fileStream = fs.createWriteStream(filePath);
      videoResponse.data.pipe(fileStream);

      fileStream.on("finish", async () => {
        const stats = fs.statSync(filePath);
        const fileSizeInMB = stats.size / (1024 * 1024);

        if (fileSizeInMB > 25) {
          await api.sendMessage(`❌ | "${title}" का साइज ${fileSizeInMB.toFixed(2)}MB है, जो 25MB से ज़्यादा है।\n📥 डाउनलोड लिंक: ${downloadUrl}`, event.threadID);
          fs.unlinkSync(filePath);
          return;
        }

        await api.sendMessage({
          body: `🎬 | आपका वीडियो "${title}" डाउनलोड हो गया है!`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID);

        fs.unlinkSync(filePath);
        api.unsendMessage(findingMessage.messageID);
      });

      videoResponse.data.on("error", async (error) => {
        console.error(error);
        await api.sendMessage(`❌ | वीडियो डाउनलोड करने में समस्या हुई: ${error.message}`, event.threadID);
        fs.unlinkSync(filePath);
      });

    } catch (error) {
      console.error("Full error:", error);

      let errorMessage = "अज्ञात त्रुटि हुई।";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.message === "string") {
        errorMessage = error.message;
      } else {
        errorMessage = JSON.stringify(error);
      }

      await api.sendMessage(`❌ | वीडियो प्राप्त करने में समस्या हुई:\n${errorMessage}`, event.threadID);
    }
  }
};

module.exports.run = async function () {};