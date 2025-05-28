const axios = require("axios");
const fs = require("fs");
const ytdl = require('@distube/ytdl-core');
const ytSearch = require('yt-search'); // Import yt-search

module.exports.config = {
    name: "media",
    version: "1.0.0",
    hasPermission: 0,
    credits: "uzairrajput",
    description: "Play music or video from YouTube",
    commandCategory: "utility",
    usages: "[title]",
    cooldowns: 10,
    dependencies: {},
};

module.exports.run = async ({ api, event }) => {
    try {
        const input = event.body;
        const text = input.substring(7);
        const data = input.split(" ");

        if (data.length < 2) {
            return api.sendMessage("⚠️ Please put a title or name of the media (music or video).", event.threadID);
        }

        data.shift();
        const mediaType = data[0];
        data.shift();
        const mediaTitle = data.join(" ");

        api.sendMessage(`✅Apki Request Jari hai please wait"${mediaTitle}"...`, event.threadID, event.messageID);

        // Use yt-search to search for videos
        const searchResults = await ytSearch(mediaTitle);

        if (!searchResults.videos.length) {
            return api.sendMessage("Error: No valid search results found.", event.threadID, event.messageID);
        }

        const media = searchResults.videos[0];
        const mediaId = media.videoId;

        let stream;
        let fileName;
        let filePath;

        if (mediaType.toLowerCase() === 'music') {
            stream = ytdl(mediaId, {
                quality: 'highestaudio',
            });
            fileName = `${media.title}.mp3`;
            filePath = `./cache/${fileName}`;
        } else if (mediaType.toLowerCase() === 'video') {
            stream = ytdl(mediaId, {
                filter: 'videoandaudio',
                quality: 'highest',
            });
            fileName = `${media.title}.mp4`;
            filePath = `./cache/${fileName}`;
        } else {
            return api.sendMessage("Error: Invalid media type. Use 'music' or 'video'.", event.threadID, event.messageID);
        }

        stream.pipe(fs.createWriteStream(filePath));

        stream.on('end', () => {
            console.info('[DOWNLOADER] Downloaded');

            const message = {
                body: `🎵  »»𝑶𝑾𝑵𝑬𝑹««★™  »»𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵««
          🥀𝒀𝑬 𝑳𝑶 𝑩𝑨𝑩𝒀 𝑨𝑷𝑲𝑰💞! 🥰\n\nTitle: ${media.title}`,
                attachment: fs.createReadStream(filePath),
            };

            api.sendMessage(message, event.threadID, () => {
                fs.unlinkSync(filePath); // Remove the downloaded file after sending
            });
        });

        stream.on('error', (err) => {
            console.error('[ERROR]', err);
            api.sendMessage('An error occurred while processing the command.', event.threadID);
        });
    } catch (error) {
        console.error('[ERROR]', error);
        api.sendMessage('An error occurred while processing the command.', event.threadID);
    }
};