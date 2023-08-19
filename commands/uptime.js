const db = require("easy-db-json");
const ytServices = require("../youtubeService");

db.setFile("../db.json");

async function getUptime() {
    const startTime = db.get(uptime);
    const now = Date.now();
    const timeRunning = now - startTime;

    const seconds = Math.floor(timeRunning / 1000);
    const minutes = Math.floor(timeRunning / (1000 * 60));
    const hours = Math.floor(timeRunning / (1000 * 60 * 60));

    // just too much
    // if (hours < 1) {
    //     let returnMessage =
    //         "Stream has been running for " +
    //         minutes +
    //         " mins, " +
    //         seconds +
    //         " seconds!";
    //     await ytServices.insertMessage(returnMessage);
    //     return true;
    // } else {
    //     let returnMessage =
    //         "Stream has been running for " +
    //         hours +
    //         " hours, " +
    //         minutes +
    //         " mins and  " +
    //         seconds +
    //         " seconds!";
    //     await ytServices.insertMessage(returnMessage);
    //     return true;
    // }

    await ytServices.insertMessage(`The stream has been running for ${hours} hours, ${minutes} minutes and ${seconds} seconds!`)
}

module.exports = getUptime