const db = require("easy-db-json");

db.setFile("../db.json");

async function getUptime(msg) {
  const startTime = new Date(db.get("uptime")).valueOf();
  const now = new Date().valueOf();

  const milliseconds = now - startTime; // in milliseconds
  const seconds = Math.floor(milliseconds / 1000); // in seconds
  const minutes = Math.floor(seconds / 60); // in minutes
  const hours = Math.floor(seconds / 3600); // in hours

  return await msg(
    `AlienBot has been running for ${hours} hours, ${minutes} minutes and ${seconds} seconds (thats ${milliseconds} in milliseconds)!`
  );
}

module.exports = getUptime;
