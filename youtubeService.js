const config = require("./config.json");
const { google } = require("googleapis");
const db = require("easy-db-json");
const containsBadWords = require("./utils/containsBadWords.js");
const handleCommand = require("./commands/commands.js");
const rand = require("./utils/generateRandom.js");
const getChannelName = require("./utils/getChannelName");

/** @typedef Message
 *  @property {string} kind
 *  @property {string} etag
 *  @property {string} id
 * @property {{ type: string, liveChatId: string, authorChannelId: string, publishedAt: string, hasDisplayContent: boolean, displayMessage: string, textMessageDetails: {messageText: string}}} snippet
 */

db.setFile("./db.json");

const youtube = google.youtube("v3");
const OAuth2 = google.auth.OAuth2;

const SECOND = 1000;
const MINUTE = SECOND * 60;

const sigIntMessage = "AlienBot-YT turned off!";

const clientId = config.CLIENT_ID;
const clientSecret = config.CLIENT_SECRET;
const redirectURI = config.CALLBACK_DOMAIN + "/callback";

const scope = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.force-ssl",
  //"https://www.googleapis.com/auth/userinfo.profile", if we ever want to get username
];

let liveChatId;
let nextPage;
const intervalTime = config.INTERVAL_TIME || 5000;
let interval;

/**
 * @type {Message[]}
 */
let chatMessages = [];

const auth = new OAuth2(clientId, clientSecret, redirectURI);

auth.on("tokens", function (tokens) {
  db.set("tokens", tokens);
});

async function getCode(res) {
  res.redirect(
    auth.generateAuthUrl({
      access_type: "offline",
      scope,
    })
  );
}

async function setAuth({ tokens }) {
  auth.setCredentials(tokens);
  setTimeout(function () {
    auth.refreshAccessToken();
  }, tokens.expiry_date - Date.now());
  console.log("successfully set credentials.");
  db.set("tokens", tokens);
}

async function getToken(code) {
  const credentials = await auth.getToken(code);
  setAuth(credentials);
}

async function findChat() {
  db.set("uptime", Date.now());

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
    console.log("Errors are: " + error.errors.join(", "));
  }
}

async function insertMessage(messageText) {
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
}

async function stopChatTracking() {
  clearInterval(interval);
}

async function getChatMessages() {
  const res = await youtube.liveChatMessages.list({
    auth,
    part: ["snippet"],
    liveChatId,
    pageToken: nextPage,
  });

  const { data } = res;
  const newMessages = data.items;

  chatMessages = newMessages;

  nextPage = data.nextPageToken;

  console.log(`total new messages: ${newMessages.length}`);
}

async function startChatTracking() {
  if (!liveChatId) {
    console.error(
      'No live chat ID found. Please press the "findChat" button to get your live chat ID.'
    );
  }

  interval = setInterval(function () {
    getChatMessages();
  }, intervalTime);
}

async function checkTokens() {
  const tokens = await db.get("tokens");

  if (tokens) {
    console.log("Found tokens!");
    auth.setCredentials(tokens);

    if (Date.now() > tokens.expiry_date) {
      auth.refreshAccessToken();
    }

    return;
  }
  console.log("no auth tokens found.");
  return;
}

/**
 *
 * @param {Message} messageObj
 * @returns
 */
async function mod(messageObj) {
  const message = messageObj.snippet.displayMessage;

  if (containsBadWords(message)) {
    const { data } = await youtube.channels.list({
      part: "snippet",
      id: messageObj.snippet.authorChannelId,
      auth,
    });

    return await insertMessage(
      `@${data.items[0].snippet.customUrl} That word is not allowed to use!`
    );
  }

  if (message.startsWith("!")) {
    handleCommand(message, messageObj.snippet.authorChannelId);
  }
  return;
}

async function startModServices() {
  setInterval(function () {
    for (const message of chatMessages) {
      if (db.get("latestMessage" == message)) {
        continue;
      }

      mod(message);

      if (db.get("FirstMessage") == null) {
        db.set("FirstMessage", message);
      } else {
        db.set("latestMessage", message);
      }
    }
  }, intervalTime + 100);
}

async function startPromoting() {
  setTimeout(async function () {
    insertMessage(config.PROMOTIONAL_MESSAGE);
    const msgLine = rand(1, 6);

    const filePath = path.join(__dirname, "txt", "scheduled.txt");
    const data = await fs.readFile(filePath, { encoding: "utf-8" }).split("\n");

    await insertMessage(data[msgLine]);
    return true;
  }, MINUTE * 3);
}

checkTokens();

process.on("SIGINT", function () {
  // i forgot what i was going to do :sweat_smile:
  if (liveChatId) insertMessage(sigIntMessage);
  process.exit();
});

/**
 *
 * @param {string} id
 */
async function getChannelTag(id) {}

module.exports = {
  getCode,
  insertMessage,
  startChatTracking,
  stopChatTracking,
  findChat,
  getToken,
  startModServices,
  startPromoting,
};
