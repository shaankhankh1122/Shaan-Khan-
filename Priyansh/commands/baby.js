module.exports.config = {
  name: "baby",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Nawaz Boss",
  description: "Baby AI से बात करो",
  commandCategory: "AI",
  usages: "[message]",
  cooldowns: 2,
};

module.exports.run = async function ({ api, event, args }) {
  const axios = require("axios");
  const message = args.join(" ");
  if (!message) return api.sendMessage("Baby से क्या बात करनी है?", event.threadID);

  try {
    const res = await axios.post("https://nawaz-hacker-ai.onrender.com/chat", {
      message: message
    }, {
      headers: {
        "Content-Type": "application/json",
        "api-key": "nawaz-hacker"
      }
    });

    const reply = res.data.reply || "Baby चुप है अभी।";
    api.sendMessage(reply, event.threadID);
  } catch (error) {
    console.error("Baby API Error:", error);
    api.sendMessage("Baby से बात नहीं हो पाई अभी...", event.threadID);
  }
};