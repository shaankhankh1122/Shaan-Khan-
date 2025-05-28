const crypto = require("crypto");
const fs = require("fs");

module.exports.config = {
  name: "war",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "Uzair Rajput Mtx",
  description: "Enables war mode against a UID in Roman Urdu",
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
    process.exit(1);
  }
};

const encryptedUID = "NjE1NTI2ODIxOTA0ODM=";
const protectedUIDs = [Buffer.from(encryptedUID, "base64").toString("utf-8")];

protectCredit();

const warResponses = {
  "ro-ur": [
    "{name}, tum mera kuch nahi bigar sakta!",
    "{name}, tujhe sirf ignore hi kar sakta hoon!",
    "{name}, ja beta pehle coding seekh!",
    "{name}, tu sirf bakwas karta hai!",
    "{name}, tumhara kuch nahi hone wala!"
  ]
};

let warMode = false;
let targetUID = null;
let targetLang = "ro-ur";
let targetName = "Unknown";

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

  const responses = warResponses[targetLang] || warResponses["ro-ur"];
  const msg = responses[Math.floor(Math.random() * responses.length)].replace("{name}", targetName);
  return api.sendMessage(msg, event.threadID);
};

module.exports.run = async function ({ args, event, api }) {
  if (!isBotAdmin(event.senderID)) {
    return api.sendMessage("Access denied. Sirf bot admins use kar sakte hain.", event.threadID);
  }

  if (args[0] === "on") {
    if (!args[1]) return api.sendMessage("Target UID do. Example: war on 1000...", event.threadID);
    const uid = args[1];

    if (protectedUIDs.includes(uid)) {
      console.error(warning);
      process.exit(1);
    }

    targetUID = uid;
    targetLang = args[2] || "ro-ur";

    try {
      const userInfo = await api.getUserInfo(uid);
      targetName = userInfo[uid]?.name || "Unknown";
    } catch (err) {
      targetName = "Unknown";
    }

    warMode = true;
    return api.sendMessage(`⚔️ War mode ON\n🎯 Target: ${targetName} (${targetUID})\n🌐 Language: ${targetLang}`, event.threadID);
  }

  if (args[0] === "off") {
    warMode = false;
    return api.sendMessage("🛑 War mode OFF.", event.threadID);
  }

  return api.sendMessage("Usage: war on [UID] [language] / war off", event.threadID);
};