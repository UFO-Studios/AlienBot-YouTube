const express = require("express");
const path = require("node:path");
const youtube = require("./youtubeService");
const isLoggedIn = require("./utils/isLoggedIn.js");

const server = express();

server.get("/", async (_req, res) => res.redirect(await isLoggedIn()));

server.get("/main", (_req, res) => {
  res.sendFile(path.join(__dirname, "/main.html"));
});

server.get("/auth", (_req, res) => {
  youtube.getCode(res);
});

server.get("/callback", (req, res) => {
  const code = req.query;
  youtube.getToken(code);

  res.redirect("/main");
});

server.get("/findChat", (_req, res) => {
  youtube.findChat();
  res.redirect("/main");
});

server.get("/startChatTracking", (_req, res) => {
  youtube.startChatTracking();
  res.redirect("/main");
});

server.get("/insertMessage", (req, res) => {
  youtube.insertMessage(req.query.message);
  res.redirect("/main");
});

server.get("/startModServices", (_req, res) => {
  youtube.startModServices();
  res.redirect("/main");
});

server.get("/startLivestream", (req, res) => {
  const { title, description, privacyStatus } = req.query;
  youtube.startLivestream(title, description, privacyStatus);
  res.redirect("/main");
});

server.get("/startPromoting", (_req, res) => {
  youtube.startPromoting()
  res.redirect("/main")
})

server.get("/fullStart", async (req, res) => {
  await youtube.startLivestream()
  await youtube.findChat();
  youtube.startChatTracking();
  youtube.startModServices();

  res.redirect("/main");
});

server.listen(4000, () =>
  console.log("server started on http://localhost:4000!")
);
