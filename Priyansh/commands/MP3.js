const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const https = require("https");

function deleteAfterTimeout(filePath, timeout = 5000) {
  setTimeout(() => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (!err) {
          console.log(`✅ Deleted file: ${filePath}`);
        } else {
          console.error(`❌ Error deleting file: ${err.message}`);
        }
      });
    }
  }, timeout);
}

module.exports = {
  config: {
    name: "mp3",
    version: "2.0.2",
    hasPermssion: 0,
    credits: "Shaan",
    description: "Download YouTube song or video",
    commandCategory: "Media",
    usages: "[songName] [optional: video]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    if (args.length === 0) {
      return api.sendMessage("⚠️ Gaane ka name tw likho na! 😒", event.threadID);
    }

    const mediaType = args[args.length - 1].toLowerCase() === "video" ? "video" : "audio";
    const songName = mediaType === "video" ? args.slice(0, -1).join(" ") : args.join(" ");

    const processingMessage = await api.sendMessage(
      `✅ "${songName}" Apki Request Jari Hai Please Wait...`,
      event.threadID,
      null,
      event.messageID
    );

    try {
      // 🔎 **YouTube Search**
      const searchResults = await ytSearch(songName);
      if (!searchResults || !searchResults.videos.length) {
        throw new Error("Kuch nahi mila! Gaane ka namr sahi likho. 😑");
      }

      // 🎵 **Top Result ka URL**
      const topResult = searchResults.videos[0];
      const videoUrl = `https://www.youtube.com/watch?v=${topResult.videoId}`;

      // 🖼 **Download Thumbnail**
      const thumbnailUrl = topResult.thumbnail;
      const safeTitle = topResult.title.replace(/[^a-zA-Z0-9]/g, "_");
      const downloadDir = path.join(__dirname, "cache");
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }
      const thumbnailPath = path.join(downloadDir, `${safeTitle}.jpg`);

      const thumbnailFile = fs.createWriteStream(thumbnailPath);
      await new Promise((resolve, reject) => {
        https.get(thumbnailUrl, (response) => {
          response.pipe(thumbnailFile);
          thumbnailFile.on("finish", () => {
            thumbnailFile.close(resolve);
          });
        }).on("error", (error) => {
          fs.unlinkSync(thumbnailPath);
          reject(new Error(`Thumbnail download failed: ${error.message}`));
        });
      });

      // 📩 **Send Thumbnail First**
      await api.sendMessage(
        {
          attachment: fs.createReadStream(thumbnailPath),
          body: `🎶 **Title:** ${topResult.title}\n👀 ..Thora sa Wait karo Song load Ho raha hai 😘`,
        },
        event.threadID
      );

      // 🗑 **Delete Thumbnail After 5 Seconds**
      deleteAfterTimeout(thumbnailPath, 5000);

      // 🖥 **API Call to YouTube Downloader**
      const apiUrl = `https://music-api-p3os.onrender.com/download?url=${encodeURIComponent(videoUrl)}&type=${mediaType}`;
      const downloadResponse = await axios.get(apiUrl);

      if (!downloadResponse.data.file_url) {
        throw new Error("Download fail ho gaya. 😭");
      }

      const downloadUrl = downloadResponse.data.file_url.replace("http:", "https:");
      const filename = `${safeTitle}.${mediaType === "video" ? "mp4" : "mp3"}`;
      const downloadPath = path.join(downloadDir, filename);

      // ⬇️ **Download Media File**
      const file = fs.createWriteStream(downloadPath);
      await new Promise((resolve, reject) => {
        https.get(downloadUrl, (response) => {
          if (response.statusCode === 200) {
            response.pipe(file);
            file.on("finish", () => {
              file.close(resolve);
            });
          } else {
            reject(new Error(`Download fail ho gaya. Status: ${response.statusCode}`));
          }
        }).on("error", (error) => {
          fs.unlinkSync(downloadPath);
          reject(new Error(`Error downloading file: ${error.message}`));
        });
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      // 🎧 **Send the MP3/MP4 File**
      await api.sendMessage(
        {
          attachment: fs.createReadStream(downloadPath),
          body: `𝐎𝐰𝐧𝐞𝐫 ${mediaType === "video" ? "Video 🎥" : "»»𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵««"} 𝒀𝑬 𝑳𝑶 𝑩𝑨𝑩𝒀 𝑨𝑷𝑲𝑰 𝑺𝑶𝑵𝑮\n𝐄𝐧𝐣𝐨𝐲 𝐊𝐚𝐫𝐨! 😍`,
        },
        event.threadID,
        event.messageID
      );

      // 🗑 **Auto Delete File After 5 Seconds**
      deleteAfterTimeout(downloadPath, 5000);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      api.sendMessage(`❌ Error: ${error.message} 😢`, event.threadID, event.messageID);
    }
  },
};