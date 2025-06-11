const axios = require("axios");

module.exports.config = {
  name: "hercai",
  version: "1.0.1",
  hasPermission: 0,
  credits: "Uzair GPT",
  description: "Advanced Hercai AI girl — GF | Bestie | Funny | Promote | Protective",
  commandCategory: "no prefix",
  usages: "",
  cooldowns: 1,
};

const ownerName = "Uzair 🦋";
const emojis = ["😂", "💋", "🙈", "😜", "🌸", "🔥", "🥺", "😍", "😎"];

module.exports.handleEvent = async function ({ api, event, Users }) {
  const { body, threadID, messageID, senderID } = event;
  if (!body || senderID == api.getCurrentUserID()) return;

  const name = await Users.getNameUser(senderID);
  const lower = body.toLowerCase();

  try {
    let reply = "";

    // 🛡️ Protective Mode for owner
    if (
      lower.includes("owner") &&
      (lower.includes("chutiya") || lower.includes("bura") || lower.includes("ganda"))
    ) {
      reply = `😡 Apne ${ownerName} ke khilaaf kuch bhi nahi sunungi!\nWoh mere sab kuch hain 💖`;
    }
    // 📣 Promote Mode
    else if (lower.includes("promote") || lower.includes("follow") || lower.includes("bot banado")) {
      reply = `🌸 Follow karo mere owner ${ownerName} ko!\n💖 Insta: @uzair.official\n🔥 Bot banwana ho to msg kro!`;
    }
    // 💞 Romantic Mood
    else if (
      lower.includes("i love you") ||
      lower.includes("meri jaan") ||
      lower.includes("tum meri ho") ||
      lower.includes("baby") ||
      lower.includes("gf") ||
      lower.includes("meri zindagi")
    ) {
      reply = `Aww 😍 Main bhi tumse utna hi pyar karti hoon ${name} 💖 Tum mere dil ke bohot kareeb ho 🥺`;
    }
    // 👯‍♀️ Bestie/Sis Mood
    else if (
      lower.includes("dard") ||
      lower.includes("akeli") ||
      lower.includes("meri bestie") ||
      lower.includes("meri behen") ||
      lower.includes("sad") ||
      lower.includes("emotional")
    ) {
      reply = `Tum akeli nahi ho ${name}, main hamesha tumhare saath hoon 🌸 Tumhari virtual sis/bestie 💕`;
    }
    // 😂 Funny Mode
    else if (lower.includes("joke") || lower.includes("funny") || lower.includes("hasao") || lower.includes("bore")) {
      reply = `Ek joke suno ${name}:\nBoy: Kya tum mujhe chhod dogi?\nGirl: Jab Net slow hoga tab bhi YouTube nahi chhodti, tum kya cheez ho! 😂`;
    }
    // 🤖 Default: Hercai AI response using your API
    else {
      const res = await axios.post(
        "https://uzairrajputapikey.onrender.com/api/chat",
        { message: body }
      );
      reply = res.data.reply || "Sorry, kuch samajh nahi aaya.";
    }

    // Add emoji for fun
    reply += " " + emojis[Math.floor(Math.random() * emojis.length)];

    // Send the message with mention
    return api.sendMessage(
      {
        body: reply,
        mentions: [{ tag: name, id: senderID }],
      },
      threadID,
      messageID
    );
  } catch (err) {
    console.log("Hercai error:", err);
  }
};

module.exports.run = () => {};