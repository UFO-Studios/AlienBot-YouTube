const fs = require("node:fs/promises");
const path = require("node:path");
const generateRandom = require("../utils/generateRandom.js");

//read quotes.txt
const filePath = path.resolve("./txt/quotes.txt");
const data = await fs
  .readFile(filePath, { encoding: "utf-8" })
  .then(function (d) {
    return d.toString().split("\n");
  });

async function quote(msg) {
  await msg(data[generateRandom(1, 24)]);
  return true;
}

module.exports = quote;
