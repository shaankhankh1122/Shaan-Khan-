const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "emojimix",
  version: "1.0",
  hasPermission: 0,
  credits: "Raj",
  description: "Mix 2 emojis together using Emoji Kitchen",
  commandCategory: "fun",
  usages: "emojimix 😗🙃",
  cooldowns: 3
};

module.exports.run = async function({ api, event }) {
  const { body, threadID, messageID } = event;

  const input = body.slice(body.indexOf(" ") + 1).trim(); // Get emojis

  if (!input || input.length < 2) {
    return api.sendMessage("❌ Please type 2 emojis together.\nExample: emojimix 😗🙃", threadID, messageID);
  }

  const emoji1 = input[0];
  const emoji2 = input[1];

  try {
    const res = await axios.get(`https://nobita-emojimix.onrender.com/emojimix?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}`, {
      responseType: "stream"
    });

    const filePath = path.join(__dirname, "cache", `emojimix_${Date.now()}.png`);
    const writer = fs.createWriteStream(filePath);
    res.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        body: `✨ Mix of ${emoji1} + ${emoji2}`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

    writer.on("error", () => {
      api.sendMessage("❌ Error writing image file", threadID, messageID);
    });

  } catch (err) {
    console.error("❌ API Error:", err.message);
    api.sendMessage("❌ Failed to fetch emoji mix. Try again later.", threadID, messageID);
  }
};