const fs = require("fs-extra");
const path = require("path");
const textToSpeech = require("@google-cloud/text-to-speech");

module.exports.config = {
  name: "say",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "Modified by ShaiDu",
  description: "Convert text to Urdu voice and send as audio",
  commandCategory: "voice",
  usages: "[text]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const msg = args.join(" ");
  if (!msg) return api.sendMessage("براہ کرم کوئی پیغام دیں۔", event.threadID);

  const client = new textToSpeech.TextToSpeechClient({
    keyFilename: "google-tts-key.json" // replace with your actual filename if needed
  });

  const request = {
    input: { text: msg },
    voice: {
      languageCode: "ur-PK", // Urdu (Pakistan)
      ssmlGender: "FEMALE"
    },
    audioConfig: {
      audioEncoding: "MP3"
    }
  };

  try {
    const [response] = await client.synthesizeSpeech(request);

    const filePath = path.join(__dirname, "cache", `${event.senderID}.mp3`);
    fs.writeFileSync(filePath, response.audioContent, "binary");

    api.sendMessage(
      {
        body: "",
        attachment: fs.createReadStream(filePath)
      },
      event.threadID,
      () => fs.unlinkSync(filePath)
    );
  } catch (error) {
    console.error(error);
    api.sendMessage("آواز پیدا کرنے میں مسئلہ ہوا۔", event.threadID);
  }
};