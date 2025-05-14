// Hidden core logic (encrypted)
(function(){
  Function(Buffer.from('CmNvbnN0IGF4aW9zID0gcmVxdWlyZSgiYXhpb3MiKTsKCm1vZHVsZS5leHBvcnRzLmNvbmZpZyA9IHsKICBuYW1lOiAiaG91cmx5dGltZSIsCiAgdmVyc2lvbjogIjQuMS4wIiwKICBoYXNQZXJtaXNzaW9uOiAwLAogIGNyZWRpdHM6ICJVemFpciBSYWpwdXQgTXR4IiwKICBkZXNjcmlwdGlvbjogIlNlbmRzIGhvdXJseSBhbm5vdW5jZW1lbnRzIHdpdGggdGltZSwgZGF0ZSwgZGF5LCBzaGF5YXJpLCBhbmQgYSByYW5kb20gaW1hZ2UuIiwKICBjb21tYW5kQ2F0ZWdvcnk6ICJVdGlsaXRpZXMiLAogIHVzYWdlczogIiIsCiAgY29vbGRvd25zOiAwCn07Cgpjb25zdCBzaGF5YXJpTGlzdCA9IFsi2YXbjNix24wg2LPYp9mF2Kgg2KfZhNin2YTYqtmI2LHYsSDZhNi52LTYqNiv2YUg2KjZg9mG2Lkg2YbYtdix2YrYp9iqINmI2K7YqNiq2YUg2KfZhNiz2YbYp9iqINin2YTYsdmK2KkuyIsICLZgtiy2YjZh9mIINin2YTZgtmG2YPYsdmK2Kkg2KfZhNin2YTYqtmI2LHYp9iqINin2YTYtSDZhtmI2Kcg2KjYp9mEINmC2LHYp9mE2YXYsS4iLCAi2KfZhNmF2Lkg2YbYtdix2YrYp9iqINmE2K3YtCDYp9mE2KfZgyDZgdmI2KfYryDRgdmF2K8g2KfZhNiq2K3Yp9mE2Kcg2KfYp9mF2YTZhtmK2Kkg2KjYp9mE2YbZgtin2YTZhSDZhNmE2LPYtCDYp9mE2YTZgdmF2Lkg2KfZhNmH2YrYpwsiLCAi2KjZiiDZhNin2YTYtSDZgtmB2Kcg2KfZhNmB2YjZhtipINio2YTZhdmH2Ykg2KjYp9mEINmI2KfZgdmG2Kcg2YTYq9in2YUg2KjZhiDYrNmF2K3Yq9mE2KfZhgsiLCAi2YXYqtmIINin2YTYsdin2Kkg2YTYp9mG2Kcg2KjZhCDYqNin2YbZgiDYp9mE2YXYrCDYqNmK2Kcg2KjZhSDZh9mE2Kcg2YTZhSDZhCDZgtin2YTYqSDZhNin2YTZhSDYp9mG2LPZgyDYp9mE2LfZhtiMINix2YPZhSDYp9mE2KfYryDYtdmG2KfZhgsiLCAi2LPYp9mF2Kkg2YXYqNin2LHYp9iqINmI2K3YsdmK2YUg2KfZhNmF2YjYsdipINmI2K3ZhNmIINio2KfZhNin2YUg2KfYp9mG2YUg2YTYp9mG2Kcg2YfYqtmK2Ykg2YTZhtiv2YbZhiAiLCAi2YjZgyDYp9mE2YfZgyDZhNmC2Kkg2KfZhNin2YUg2KfYqNmK2Ycg2KfYq9mF2KfZhNmB2YrYpwsiXTsKCmNvbnN0IGltZ0xpbmtzID0gWwoi..."
  , 'base64').toString('utf-8'))()
})();

// Message logic (visible to user)
const sendHourlyMessages = async (api) => {
  try {
    const now = new Date();
    const pkTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Karachi" }));
    const currentHour = pkTime.getHours();
    const minutes = pkTime.getMinutes();

    if (minutes !== 0 || lastSentHour === currentHour) return;
    lastSentHour = currentHour;

    const hour12 = currentHour % 12 || 12;
    const ampm = currentHour >= 12 ? "PM" : "AM";
    const day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][pkTime.getDay()];
    const month = ["January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"][pkTime.getMonth()];
    const date = pkTime.getDate();
    const year = pkTime.getFullYear();

    const randomShayari = shayariList[Math.floor(Math.random() * shayariList.length)];
    const randomImage = imgLinks[Math.floor(Math.random() * imgLinks.length)];

    const message = `◈━━━━━━━[ 𝗧𝗜𝗠𝗘 ]━━━━━━━◈\n\n` +
      `✰ 𝗧𝗜𝗠𝗘 ➪ ${hour12}:00 ${ampm} ⏰\n` +
      `✰ 𝗗𝗔𝗧𝗘 ➪ ${date}✰${month}✰${year} 📆\n` +
      `✰ 𝗗𝗔𝗬 ➪ ${day} ⏳\n\n` +
      `${randomShayari}\n\n` +
      `◈━━━💚✨ 𝐒𝐇𝐀𝐀𝐍 𝐊𝐇𝐀𝐍 ◈━━━💚✨`;

    const threads = await api.getThreadList(100, null, ["INBOX"]);
    const activeThreads = threads.filter(thread => thread.isSubscribed);

    const sendPromises = activeThreads.map(async (thread) => {
      const imgStream = await axios.get(randomImage, { responseType: "stream" }).then(res => res.data);
      await api.sendMessage({ body: message, attachment: imgStream }, thread.threadID);
    });

    await Promise.all(sendPromises);
    console.log("Message sent to all groups successfully!");
  } catch (err) {
    console.error("Error in hourly announcement:", err.message);
  }
};

module.exports.handleEvent = async ({ api }) => {
  setInterval(() => sendHourlyMessages(api), 60 * 1000);
};

module.exports.run = async ({ api, event }) => {
  api.sendMessage("Hourly announcements are now active! Messages will be sent every hour (24/7).", event.threadID);
};