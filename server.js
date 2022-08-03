const express = require("express");
const path = require("node:path");
const youtube = require("./youtubeService")

const server = express();

server.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/index.html"))
);

server.get("/auth", (req, res) => {
    youtube.getCode(res)
})

server.get("/callback", (req, res) => {
    const code = req.query
    youtube.getToken(code)

    res.redirect("/")
})

server.get("/findChat", (req, res) => {
  youtube.findChat()
  res.redirect("/")
})

server.get("/startChatTracking", (req, res) => {
  youtube.startChatTracking()
  res.redirect("/")
})

server.get("/insertMessage", (req, res) => {
  youtube.insertMessage()
  res.redirect("/")
})

server.listen(3000, () => console.log("server listening on port 3000!"));
