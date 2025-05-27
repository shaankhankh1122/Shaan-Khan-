const crypto = require("crypto");
const fs = require("fs");

module.exports.config = {
  name: "war",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "Uzair Rajput Mtx",
  description: "Enables war mode against a UID in multiple languages",
  commandCategory: "Admin",
  usages: "war on [UID] [language] / war off",
  cooldowns: 5,
};


const lockedHash = "f0c27f8bed58b4e691448d4df103cab3bf547a81f9b50d42ccd4d42ec299ef42";
const warning = Buffer.from("4pqg77iPIFNjcmlwdCBiYW5haSBVemFpciBNdHggbmUuIFTFqyBjcmVkaXQgY2hhbmdlIGthcmtlIGRldiBVemFpciBuYWhpIGJhbiBzYWt0YSE=", 'base64').toString("utf-8");

const protectCredit = () => {
  const current = module.exports.config.credits;
  const hash = crypto.createHash("sha256").update(current).digest("hex");
  if (hash !== lockedHash) {
    console.error(warning);
    process.exit(1); // Credit Change karne ke bare me sochna bhi nahi warna pura bot band ho jyga agar yaqeen nahi hai tw try karlo This Code Made By Uzair Rajput Mtx 
  }
};


const encryptedUID = "NjE1NTI2ODIxOTA0ODM="; 
const protectedUIDs = [Buffer.from(encryptedUID, "base64").toString("utf-8")];

protectCredit();


const warResponses = {
  en: ["{name}, you're no match for me!"],
  hi: ["{name}, तुम मुझसे जीत नहीं सकते!"],
  ur: ["{name}, تم میرا کچھ نہیں بگاڑ سکتے!"],
  bn: ["{name}, তুমি আমার সামনে কিছুই না!"],
  "ro-ur": ["{name}, tumhara kuch nahi hone wala!"]
};

let warMode = false;
let targetUID = null;
let targetLang = "en";


const isBotAdmin = (uid) => {
  try {
    const config = JSON.parse(fs.readFileSync(__dirname + "/../../config.json", "utf8"));
    return config.ADMINBOT.includes(uid);
  } catch (err) {
    console.error("Config read error:", err);
    return false;
  }
};

module.exports.handleEvent = async function ({ event, api }) {
  if (!warMode || event.senderID !== targetUID) return;

  if (protectedUIDs.includes(event.senderID)) {
    console.error(warning);
    process.exit(1); 
  }

  const responses = warResponses[targetLang] || warResponses["en"];
  const msg = responses[Math.floor(Math.random() * responses.length)].replace("{name}", event.senderID);
  return api.sendMessage(msg, event.threadID);
};

module.exports.run = function ({ args, event, api }) {
  if (!isBotAdmin(event.senderID)) {
    return api.sendMessage("Access denied. Only bot admins can use this command.", event.threadID);
  }

  if (args[0] === "on") {
    if (!args[1]) return api.sendMessage("Please provide a UID.", event.threadID);
    if (protectedUIDs.includes(args[1])) {
      console.error(warning);
      process.exit(1);
    }
    targetUID = args[1];
    targetLang = args[2] || "en";
    warMode = true;
    return api.sendMessage(`War mode ON. Target: ${targetUID} in ${targetLang}`, event.threadID);
  } else if (args[0] === "off") {
    warMode = false;
    return api.sendMessage("War mode OFF.", event.threadID);
  } else {
    return api.sendMessage("Usage: war on [UID] [language] / war off", event.threadID);
  }
};