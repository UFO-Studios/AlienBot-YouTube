const express = require("express");
const path = require("node:path");
const youtube = require("./youtubeService");

const server = express();

server.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/index.html"))
);

server.get("/auth", (req, res) => {
  youtube.getCode(res);
});

server.get("/callback", (req, res) => {
  const code = req.query;
  youtube.getToken(code);

  res.redirect("/");
});

server.get("/findChat", (req, res) => {
  youtube.findChat();
  res.redirect("/");
});

server.get("/startTrackingChat", (req, res) => {
  youtube.startTrackingChat();
  res.redirect("/");
});

server.get("/stopTrackingChat", (req, res) => {
  youtube.stopTrackingChat();
  res.redirect("/");
});

server.get("/startReadingChat", (req, res) => {
  youtube.startReadingChat();
  res.redirect("/");
});

server.get("/insertMessage", (req, res) => {
  let msg;
  req.query.hasOwnProperty("msg")
    ? (msg = req.query.msg)
    : (msg = "hello world");
  console.log(msg);
  console.log(req.query);
  console.log(req.query.hasOwnProperty("msg"));
  youtube.insertMessage(msg);
  res.redirect("/");
});

server.get("/startAutoMod", (req, res) => {
  youtube.startAutoMod();
  res.redirect("/");
});

server.listen(3000, () => console.log("server listening on port 3000!"));
