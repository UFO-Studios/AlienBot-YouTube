const db = require("easy-db-json");
const ytServices = require("../youtubeService");

db.setFile("../db.json");

async function getUptime() {
    const startTime = db.get(uptime);
    const now = Date.now();
    const timeRunning = new Date(now - startTime);

    // just too much
    // const seconds = Math.floor(timeRunning / 1000);
    // const minutes = Math.floor(timeRunning / (1000 * 60));
    // const hours = Math.floor(timeRunning / (1000 * 60 * 60));
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

    await ytServices.insertMessage(`The stream has been running for ${timeRunning.getHours()} hours, ${timeRunning.getMinutes()} minutes and ${timeRunning.getSeconds()} seconds!`)
}

module.exports = getUptime