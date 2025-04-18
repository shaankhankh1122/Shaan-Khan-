const ytdl = require("ytdl-core");
const fs = require("fs-extra");
const path = require("path");
const yts = require("yt-search");

module.exports.config = {
  name: "music",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ShaiDu", // Don't change this
  description: "Play music by YouTube name or URL",
  commandCategory: "music",
  usages: "music <song name or YouTube link>",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  // Anti Credit Change Lock
  const fixedName = "ShaiDu"; // Hardcoded Name for security
  
  if (module.exports.config.credits !== fixedName) {
    return api.sendMessage("⚠️ اس command کے credits تبدیل کر دیے گئے ہیں۔ Command بند کر دیا گیا ہے۔", event.threadID);
  }

  const search = args.join(" ");
  if (!search) return api.sendMessage("براہ کرم گانے کا نام یا یوٹیوب لنک لکھیں۔", event.threadID);

  const msg = await api.sendMessage("🔍 تلاش جاری ہے...", event.threadID);

  try {
    const result = await yts(search);
    const video = result.videos[0];
    if (!video) return api.sendMessage("😞 گانا نہیں ملا، براہ کرم دوبارہ کوشش کریں۔", event.threadID);

    // Debugging: Log video details
    console.log("Video Details: ", video);

    const url = video.url;
    const stream = ytdl(url, { filter: "audioonly" });
    const filePath = path.join(__dirname, "cache", `${event.senderID}.mp3`);

    const writeStream = fs.createWriteStream(filePath);
    stream.pipe(writeStream);

    writeStream.on("finish", () => {
      // Debugging: Log when file is ready
      console.log("Audio file downloaded and ready for sending.");

      const songDetails = `
🎵 **گانا چل رہا ہے**:
    
**🎶 عنوان**: ${video.title}
**⏱️ دورانیہ**: ${video.timestamp}
**🎤 گانے کا فنکار**: ${video.author.name}

🔗 [YouTube لنک](https://youtu.be/${video.videoId})

📸 **تصویر**:
${video.thumbnail}

💬 **Requested by**: *ShaiDu*`

      api.sendMessage(
        {
          body: songDetails,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => {
          console.log("Message Sent!"); // Debugging message sent
          fs.unlinkSync(filePath); // Delete the file after sending
        }
      );
    });

  } catch (err) {
    console.error(err);
    api.sendMessage("😞 کچھ غلط ہو گیا، دوبارہ کوشش کریں۔", event.threadID);
  }
};