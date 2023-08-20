const express = require("express");
const path = require("node:path");
const youtube = require("./youtubeService");
const isLoggedIn = require("./utils/isLoggedIn.js");

const server = express();

server.use(function (req, res, next) {
  if (req.path != "/auth" && !isLoggedIn()) res.redirect("/auth");
  next();
});

server.get("/", function (_req, res) {
  res.sendFile(path.join(__dirname, "/index.html"));
});

server.get("/auth", function (_req, res) {
  youtube.getCode(res);
});

server.get("/callback", function (req, res) {
  const code = req.query;
  youtube.getToken(code);

  res.redirect("/");
});

server.get("/findChat", async (_req, res) => {
  try {
    await youtube.findChat();
  } catch (e) {
    console.error("Errors: " + e.errors.join(", "));
  }

  res.redirect("/");
});

server.get("/startChatTracking", function (_req, res) {
  youtube.startChatTracking();
  res.redirect("/");
});

server.get("/insertMessage", function (req, res) {
  youtube.insertMessage(req.query.message);
  res.redirect("/");
});

server.get("/startModServices", function (_req, res) {
  youtube.startModServices();
  res.redirect("/");
});

server.get("/startPromoting", function (_req, res) {
  youtube.startPromoting();
  res.redirect("/");
});

server.get("/fullStart", async function (_req, res) {
  try {
    await youtube.findChat();
    youtube.startChatTracking();
    youtube.startModServices();
    youtube.startPromoting();
  } catch (e) {
    console.error(e);
  }

  res.redirect("/");
});

server.get("/stopChatTracking", (_req, res) => {
  youtube.stopChatTracking();
  res.redirect("/");
});

server.listen(4000, function () {
  console.log("server started on http://localhost:4000!");
});
