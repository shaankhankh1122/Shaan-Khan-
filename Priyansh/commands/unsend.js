module.exports.config = {
  name: "unsend",
  version: "1.0.5",
  hasPermssion: 0,
  credits: "𝐒𝐇𝐀𝐀𝐍 𝐊𝐇𝐀𝐍",
  description: "Owner ke ❤️ react ya unsend likhne se delete, Users ke liye .unsend",
  commandCategory: "noprefix",
  usages: "Owner: unsend ya ❤️ react, Und: .unsend",
  cooldowns: 0
};

module.exports.languages = {
  "en": {
    "returnCant": "Kisi aur ka msg m kaise unsend karu?",
    "missingReply": "Reply karo us msg ko jise unsend karwana hai."
  }
};

const botOwnerID = "100016828397863"; // Apna ID Dalo Bhai 

module.exports.handleEvent = async function ({ api, event }) {
  const { body, senderID, messageReply, threadID, messageID, type, reaction } = event;

  // Owner ❤️ React kare to delete (sirf apne bot wale message pe)
  if (type === "message_reaction" && senderID === botOwnerID && reaction === "❤️") {
    api.getMessage(event.reaction.messageID, (err, info) => {
      if (!err && info.senderID === api.getCurrentUserID()) {
        return api.unsendMessage(event.reaction.messageID);
      }
    });
  }

  if (!body || !messageReply) return;

  const lowerBody = body.toLowerCase();

  // Owner unsend ya und likhe to delete
  if (senderID === botOwnerID && (lowerBody === "unsend" || lowerBody === "und")) {
    if (messageReply.senderID != api.getCurrentUserID()) return;
    return api.unsendMessage(messageReply.messageID);
  }

  // Users ke liye .unsend
  if (lowerBody === ".unsend") {
    if (messageReply.senderID != api.getCurrentUserID()) {
      return api.sendMessage(module.exports.languages["en"]["returnCant"], threadID, messageID);
    }
    return api.unsendMessage(messageReply.messageID);
  }
};

module.exports.run = function () {};