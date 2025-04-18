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

  const msg = await api.sendMessage("تلاش جاری ہے...", event.threadID);

  try {
    const result = await yts(search);
    const video = result.videos[0];
    if (!video) return api.sendMessage("گانا نہیں ملا۔", event.threadID);

    const url = video.url;
    const stream = ytdl(url, { filter: "audioonly" });
    const filePath = path.join(__dirname, "cache", `${event.senderID}.mp3`);

    const writeStream = fs.createWriteStream(filePath);
    stream.pipe(writeStream);

    writeStream.on("finish", () => {
      api.sendMessage(
        {
          body: `🎵 اب چل رہا ہے: ${video.title}\n🎤 Requested by: ShaiDu`,  // Add ShaiDu here
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => fs.unlinkSync(filePath)
      );
    });

  } catch (err) {
    console.error(err);
    api.sendMessage("کچھ غلط ہو گیا، دوبارہ کوشش کریں۔", event.threadID);
  }
};