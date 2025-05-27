const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const https = require("https");

function deleteAfterTimeout(filePath, timeout = 10000) {
  setTimeout(() => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (!err) console.log(`✅ Deleted: ${filePath}`);
        else console.error(`❌ Error deleting: ${err.message}`);
      });
    }
  }, timeout);
}

module.exports = {
  config: {
    name: "video",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "uzairrajput",
    description: "Search & download YouTube video only",
    commandCategory: "Media",
    usages: "[video name]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    if (!args[0]) return api.sendMessage("⚠️ Video ka naam likho!", event.threadID);

    const keyword = args.join(" ");
    const search = await ytSearch(keyword);
    const results = search.videos.slice(0, 6);

    if (!results.length) return api.sendMessage("❌ Koi result nahi mila!", event.threadID);

    let msg = `🔍 "${keyword}" ke results:\nKonsa chahiye? Reply karo number likh ke:\n\n`;
    results.forEach((video, i) => {
      msg += `${i + 1}. ${video.title} (${video.timestamp})\n`;
    });

    api.sendMessage(msg, event.threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        results,
      });
    });
  },

  handleReply: async function ({ api, event, handleReply }) {
    if (event.senderID !== handleReply.author) return;
    const choice = parseInt(event.body);
    if (isNaN(choice) || choice < 1 || choice > handleReply.results.length) {
      return api.sendMessage("❌ Valid number do (1-6)", event.threadID);
    }

    const video = handleReply.results[choice - 1];
    const safeTitle = video.title.replace(/[^a-zA-Z0-9]/g, "_");
    const downloadDir = path.join(__dirname, "cache");
    if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

    const thumbnailPath = path.join(downloadDir, `${safeTitle}.jpg`);
    const thumbnail = fs.createWriteStream(thumbnailPath);
    await new Promise((resolve, reject) => {
      https.get(video.thumbnail, (res) => {
        res.pipe(thumbnail);
        thumbnail.on("finish", () => thumbnail.close(resolve));
        res.on("error", reject);
      });
    });

    const apiUrl = `https://vercel.com/uzairkhan12346s-projects/ytdl/download?url=https://www.youtube.com/watch?v=${video.videoId}&type=video`;
    try {
      const res = await axios.get(apiUrl);
      const fileUrl = res.data.file_url.replace("http:", "https:");
      const filename = `${safeTitle}.mp4`;
      const filePath = path.join(downloadDir, filename);

      const file = fs.createWriteStream(filePath);
      await new Promise((resolve, reject) => {
        https.get(fileUrl, (response) => {
          if (response.statusCode === 200) {
            response.pipe(file);
            file.on("finish", () => file.close(resolve));
          } else {
            reject(new Error("Download fail"));
          }
        });
      });

      const views = video.views.toLocaleString("en-IN");

      await api.sendMessage({
        body:
          `✅ *${video.title}*\n` +
          `⏱ Duration: ${video.timestamp}\n` +
          `📺 Channel: ${video.author.name}\n` +
          `👁 Views: ${views}\n\n` +
          `Enjoy your video 🎥!`,
        attachment: [
          fs.createReadStream(thumbnailPath),
          fs.createReadStream(filePath),
        ],
      }, event.threadID);

      deleteAfterTimeout(thumbnailPath, 10000);
      deleteAfterTimeout(filePath, 15000);
    } catch (err) {
      console.error(err.message);
      api.sendMessage("❌ Video download mein issue aaya.", event.threadID);
    }
  }
};
