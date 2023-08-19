const ytci = require("@nieopierzony/yt-channel-info");

module.exports = async function getChannelName(channelId) {
  const { author } = await ytci.getChannelInfo(channelId, 1);

  return author;
};
