const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "ytdl",
  hasPermission: 0,
  version: "1.0.1",
  description: "Download full YouTube videos (not shorts)",
  credits: "SHANKAR",
  usePrefix: false,
  commandCategory: "Utility"
};

module.exports.handleEvent = async function ({ api, event }) {
  const message = event.body;

  // सिर्फ normal वीडियो लिंक को पकड़ो (shorts लिंक को स्किप करो)
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = message.match(youtubeRegex);

  if (match) {
    const url = match[0];

    try {
      const waitingMessage = await api.sendMessage(`⏳ | वीडियो डाउनलोड लिंक प्राप्त किया जा रहा है...`, event.threadID);

      const apiUrl = `https://prince-malhotra-yt-download-cvp0.onrender.com/api/ytdl?url=${encodeURIComponent(url)}&type=mp4`;
      const response = await axios.get(apiUrl);
      const data = response.data?.data;

      if (!data || !data.download) {
        await api.sendMessage(`❌ | वीडियो के लिए कोई डाउनलोड लिंक नहीं मिला।`, event.threadID);
        return;
      }

      // Check if video is a short (duration < 1 minute)
      const durationInSec = parseFloat(data.duration?.replace(/[^\d.]/g, "") || "0");
      if (durationInSec < 60) {
        await api.sendMessage(`⚠️ | यह शॉर्ट वीडियो है। कृपया कोई फुल वीडियो लिंक दें।`, event.threadID);
        return;
      }

      const downloadUrl = data.download;
      const title = data.title.replace(/[\\/:*?"<>|]/g, "");
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
          await api.sendMessage(`❌ | "${title}" का साइज ${fileSizeInMB.toFixed(2)}MB है, जो 25MB से ज्यादा है।\n📥 डाउनलोड लिंक: ${downloadUrl}`, event.threadID);
          fs.unlinkSync(filePath);
          return;
        }

        await api.sendMessage({
          body: `🎥 | वीडियो "${title}" डाउनलोड हो गया है!`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID);

        fs.unlinkSync(filePath);
        api.unsendMessage(waitingMessage.messageID);
      });

      videoResponse.data.on("error", async (error) => {
        console.error(error);
        await api.sendMessage(`❌ | वीडियो डाउनलोड करने में समस्या हुई: ${error.message}`, event.threadID);
        fs.unlinkSync(filePath);
      });

    } catch (error) {
      console.error(error);
      await api.sendMessage(`❌ | वीडियो प्राप्त करने में समस्या हुई: ${error.message}`, event.threadID);
    }
  }
};

module.exports.run = async function () {
  // Run command को खाली छोड़ते हैं क्योंकि ये auto-detect है
};