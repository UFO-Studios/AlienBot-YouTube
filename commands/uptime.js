const db = require("easy-db-json");
const youtube = require("../youtubeService");

db.setFile("../db.json");

async function getUptime() {
  const startTime = db.get(uptime);
  const now = Date.now();
  const timeRunning = new Date(now - startTime);

  await youtube.insertMessage(
    `The stream has been running for ${timeRunning.getHours()} hours, ${timeRunning.getMinutes()} minutes and ${timeRunning.getSeconds()} seconds!`
  );
}

module.exports = getUptime;
