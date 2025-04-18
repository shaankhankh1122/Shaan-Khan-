module.exports.config = {
  name: "react",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ShaiDu",
  description: "React with emoji to the message",
  commandCategory: "fun",
  usages: "react",
  cooldowns: 3
};

module.exports.run = async function ({ api, event }) {
  const reactions = ["❤", "😆", "😮", "😢", "😡", "👍", "👎"];
  const randomReact = reactions[Math.floor(Math.random() * reactions.length)];

  // اگر reply کیا گیا ہو تو اسی پر react کرو
  if (event.type === "message_reply") {
    return api.setMessageReaction(randomReact, event.messageReply.messageID, (err) => {}, true);
  } else {
    return api.sendMessage("براہ کرم کسی میسج پر reply کر کے یہ کمانڈ استعمال کریں۔", event.threadID);
  }
};