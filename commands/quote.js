const fs = require("node:fs/promises");
const path = require("node:path");
const generateRandom = require("../utils/generateRandom.js");

async function getQuote() {
  const fileLine = generateRandom(1, 24);
  //read quotes.txt

  const filePath = path.resolve("./txt/quotes.txt");
  const data = await fs
    .readFile(filePath, { encoding: "utf-8" })
    .then(function (d) {
      return d.toString().split("\n")[fileLine];
    });

  return data;
}

async function quote(msg) {
  await msg(await getQuote());
  return true;
}

module.exports = quote;
