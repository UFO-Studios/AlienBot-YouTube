const fs = require('fs');
const path = require('path');
const ytServices = require('../youtubeService.js');
const generateRandom = require("../utils/generateRandom.js")

async function getQuote() {
    const fileLine = generateRandom(1, 24)
    //read quotes.txt

    const filePath = path.join(__dirname, 'quotes.txt');
    const data = await fs.readFile(filePath, { encoding: 'utf-8' }).split("\n")

    return data[fileLine]
}

async function quote() {
    await ytServices.insertMessage(await getQuote());
    return true;
}

module.exports = quote;