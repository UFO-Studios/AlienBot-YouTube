const express = require("express");
const path = require("node:path");
const youtube = require("./youtubeService");
const isLoggedIn = require("./utils/isLoggedIn.js");

const server = express();

server.get(
  "/",
  (req, res) => res.redirect(isLoggedIn())
  //res.sendFile(path.join(__dirname, "/index.html"))
);

server.get("/main", (req, res) => {
  res.sendFile(path.join(__dirname, "/main.html"));
});

server.get("/auth", (req, res) => {
  youtube.getCode(res);
});

server.get("/callback", (req, res) => {
  const code = req.query;
  youtube.getToken(code);

  res.redirect("/main");
});

server.get("/findChat", (req, res) => {
  youtube.findChat();
  res.redirect("/main");
});

server.get("/startChatTracking", (req, res) => {
  youtube.startChatTracking();
  res.redirect("/main");
});

server.get("/insertMessage", (req, res) => {
  youtube.insertMessage(req.query.message);
  res.redirect("/main");
});

server.get("/startModServices", (req, res) => {
  youtube.startModServices();
  res.redirect("/main");
});

server.listen(4000, () =>
  console.log("server started on http://localhost:4000!")
);
