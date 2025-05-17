module.exports = {
  config: {
    name: "linkAutoDownload",
    version: "1.3.0",
    hasPermssion: 0,
    credits: "uzairrajput",
    description:
      "Automatically detects links in messages and downloads the file.",
    commandCategory: "Utilities",
    usages: "",
    cooldowns: 5,
  },
  run: async function ({ events, args }) {},
  handleEvent: async function ({ api, event, args }) {
    const axios = require("axios");
    const request = require("request");
    const fs = require("fs-extra");
    const content = event.body ? event.body : "";
    const body = content.toLowerCase();
    const { alldown } = require("uzair-mtx-downloader");
    if (body.startsWith("https://")) {
      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);
      const data = await alldown(content);
      console.log(data);
      const { low, high, title } = data.data;
      api.setMessageReaction("❤️‍🩹", event.messageID, (err) => {}, true);
      const video = (
        await axios.get(high, {
          responseType: "arraybuffer",
        })
      ).data;
      fs.writeFileSync(
        __dirname + "/cache/auto.mp4",
        Buffer.from(video, "utf-8")
      );

      return api.sendMessage(
        {
          body: `𝐎𝐖𝐍𝐄𝐑 𝑺𝑯𝑨𝑨𝑵`,
          attachment: fs.createReadStream(__dirname + "/cache/auto.mp4"),
        },
        event.threadID,
        event.messageID
      );
    }
  },
};