const config = require("./config.json");
const { google } = require("googleapis");
const db = require("easy-db-json");

db.setFile("./db.json");

const youtube = google.youtube("v3");
const OAuth2 = google.auth.OAuth2;

const clientId = config.CLIENT_ID;
const clientSecret = config.CLIENT_SECRET;
const redirectURI = "http://localhost:3000/callback";
const scope = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.force-ssl",
];

let liveChatId;
let nextPage;
const intervalTime = config.INTERVAL_TIME || 5000;
let interval;
const chatMessages = [];

const auth = new OAuth2(clientId, clientSecret, redirectURI);

auth.on("tokens", (tokens) => db.set("tokens", tokens));

const getCode = (res) => {
  const authUrl = auth.generateAuthUrl({
    access_type: "offline",
    scope,
  });
  res.redirect(authUrl);
};

const setAuth = ({ tokens }) => {
  auth.setCredentials(tokens);
  console.log("successfully set credentials.");
  console.log(tokens);
  db.set("tokens", tokens);
};

const getToken = async (code) => {
  const credentials = await auth.getToken(code);
  setAuth(credentials);
};

const findChat = async () => {
  try {
    const res = await youtube.liveBroadcasts.list({
      auth,
      part: "snippet",
      // broadcastStatus: "active",
      mine: true,
    });

    const { data } = res;

    const latestChat = await data.items[0];

    liveChatId = latestChat.snippet.liveChatId;
    console.log(`live chat id found: ${liveChatId}`);
  } catch (error) {
    console.log(error);
  }
};

const insertMessage = async (messageText) => {
  await youtube.liveChatMessages.insert({
    auth,
    part: "snippet",
    requestBody: {
      snippet: {
        liveChatId,
        type: "textMessageEvent",
        textMessageDetails: {
          messageText,
        },
      },
    },
  });
};

const stopChatTracking = async () => {
  clearInterval(interval);
};

const getChatMessages = async () => {
  const res = await youtube.liveChatMessages.list({
    auth,
    part: ["snippet"],
    liveChatId,
    pageToken: nextPage,
  });

  const { data } = res;
  const newMessages = data.items;
  chatMessages.push(...newMessages);
  nextPage = data.nextPageToken;
  console.log(`total messages: ${chatMessages.length}`);
};

const startChatTracking = async () => {
  if (!liveChatId) {
    console.error(
      'No live chat ID found. Please press the "findChat" button to get your live chat ID.'
    );
  }

  interval = setInterval(() => {
    getChatMessages();
  }, intervalTime);
};

const checkTokens = async () => {
  const tokens = await db.get("tokens");

  if (tokens) {
    console.log("tokens found");
    return auth.setCredentials(tokens);
  }
  console.log("no auth tokens found.");
};

checkTokens();

module.exports = {
  getCode,
  insertMessage,
  startChatTracking,
  stopChatTracking,
  findChat,
  getToken,
};
