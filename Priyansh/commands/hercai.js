const axios = require("axios");

module.exports.config = {
  name: "hercai",
  version: "1.0.1",
  hasPermission: 0,
  credits: "Uzair GPT",
  description: "ChatGPT-4o AI bestie using custom API",
  commandCategory: "no prefix",
  usages: "",
  cooldowns: 1,
};

const emojis = ["💋", "😎", "🥰", "🔥", "💖", "😂", "🌸", "🙈"];

module.exports.handleEvent = async function ({ api, event, Users }) {
  const { body, threadID, messageID, senderID } = event;

  if (!body || senderID == api.getCurrentUserID()) return;

  let name = senderID;
  try {
    if (Users && typeof Users.getNameUser === "function") {
      name = await Users.getNameUser(senderID);
    }
  } catch (e) {
    console.error("User name error:", e.message);
  }

  try {
    const response = await axios.post("https://uzairrajputapikey.onrender.com/api/chat", {
      message: body,
    });

    const reply = response.data.reply || "🤖 Mujhe samajh nahi aaya.";

    // Random emoji
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    return api.sendMessage(
      {
        body: `${reply} ${emoji}`,
        mentions: [{ tag: name, id: senderID }],
      },
      threadID,
      messageID
    );
  } catch (err) {
    console.error("Hercai ChatGPT error:", err.message || err);
    return api.sendMessage("❌ Diwani ko reply karne me dikkat ho gayi. Server down ho sakta hai.", threadID, messageID);
  }
};

module.exports.run = () => {};