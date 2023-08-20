const db = require("easy-db-json");
const youtube = require("../youtubeService");

db.setFile("../db.json");

async function getUptime() {
  console.log("e?");
  const startTime = db.get(uptime);
  const now = Date.now();
  const timeRunning = new Date(now - startTime);
  console.log(now, timeRunning);
  
  await youtube.insertMessage(
    `The stream has been running for ${timeRunning.getHours()} hours, ${timeRunning.getMinutes()} minutes and ${timeRunning.getSeconds()} seconds!`
  );
}

module.exports = getUptime;
