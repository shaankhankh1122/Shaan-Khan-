module.exports.config = {
  name: "unsend",
  version: "1.0.4",
  hasPermssion: 0,
  credits: "N9W9Z H9CK3R",
  description: "Owner ke liye unsend, react 😎 se delete, users ke liye +unsend",
  commandCategory: "noprefix",
  usages: "Owner: unsend ya 😎 react, Users: +unsend",
  cooldowns: 0
};

module.exports.languages = {
  "en": {
    "returnCant": "Kisi aur ka msg m kaise unsend karu?",
    "missingReply": "Reply karo us msg ko jise unsend karwana hai."
  }
};

const botOwnerID = "100069136731529"; // <-- Apna ID daal lena

module.exports.handleEvent = async function ({ api, event }) {
  const { body, senderID, messageReply, threadID, messageID, type, reaction, messageID: reactMessageID } = event;

  // Reaction se Delete (Owner ke liye) - सिर्फ 😎 पे
  if (type === "message_reaction" && senderID === botOwnerID && reaction === "😎") {
    return api.unsendMessage(reactMessageID);
  }

  if (!body || !messageReply) return;

  const lowerBody = body.toLowerCase();

  // Owner ke liye "unsend" ya "unse" likhne se delete
  if (senderID === botOwnerID && (lowerBody === "unsend" || lowerBody === "unse")) {
    if (messageReply.senderID != api.getCurrentUserID()) return;
    return api.unsendMessage(messageReply.messageID);
  }

  // Users ke liye "+unsend"
  if (lowerBody === "+unsend") {
    if (messageReply.senderID != api.getCurrentUserID()) {
      return api.sendMessage(module.exports.languages["en"]["returnCant"], threadID, messageID);
    }
    return api.unsendMessage(messageReply.messageID);
  }
};

module.exports.run = function () {};