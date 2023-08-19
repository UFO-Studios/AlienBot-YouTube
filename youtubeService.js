const config = require("./config.json");
const { google } = require("googleapis");
const db = require("easy-db-json");
const vidData = require("vid_data");
const swearjar = require("swearjar");
const { chat } = require("googleapis/build/src/apis/chat");
const handleCommand =  require("./commands/commands")
const rand = require("./utils/generateRandom")

/** @typedef Message
 *  @property {string} kind
 *  @property {string} etag
 *  @property {string} id
 * @property {{ type: string, liveChatId: string, authorChannelId: string, publishedAt: string, hasDisplayContent: boolean, displayMessage: string, textMessageDetails: {messageText: string}}} snippet
 */

db.setFile("./db.json");

const youtube = google.youtube("v3");
const OAuth2 = google.auth.OAuth2;

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
const bannedWords = [
  "word", // you thought i was gonna type in real banned words ;)
  "hehe",
];
/**
 * @type {Message[]}
 */
let chatMessages = [];
let messages = [];

const auth = new OAuth2(clientId, clientSecret, redirectURI);

auth.on("tokens", (tokens) => db.set("tokens", tokens));

const getCode = (res) => {
  const authUrl = auth.generateAuthUrl({
    access_type: "offline",
    scope,
  });
  //console.log("auth url:"+authUrl);
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

const getChatMessages = async (returnThem) => {
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

const containsBadWords = (message) => {
  return swearjar.profane(message);
};

const addCommand = async (command, response) => {
  await db.set(command, response);
  return true;
};


/**
 *
 * @param {Message} messageObj
 * @returns
 */
async function mod(messageObj) {
  const message = messageObj.snippet.displayMessage;


  if (containsBadWords(message)) {
    console.log("Banned word used!")
    return await insertMessage(
      `@${messageObj.snippet.authorChannelId} That word is not allowed to use!`
    );
  }

  if (message.startsWith("!")) {
    handleCommand(message)
  }

  
  return;
} 

setTimeout(() => {
  
}, 60000 * 3) // 1 minuite * 3 = 3 minutes yay

async function startModServices() {
  console.log("starting mod services");
  db.set("uptime", Date.now());
  setInterval(() => {
    for (const message of chatMessages) {
      if (db.get("latestMessage" == message)) continue // skip the below part if the message has already been checked. This prevents messages from being checked more than once.

      mod(message, i);
      if (db.get("FirstMessage") == null) {
        db.set("FirstMessage", message)
        db.set("latestMessage", message);
      } else {
        db.set("latestMessage", message);
      }
      } 
  }, intervalTime + 100);
}

checkTokens();

module.exports = {
  getCode,
  insertMessage,
  startChatTracking,
  stopChatTracking,
  findChat,
  getToken,
  //ModServices,
  startModServices,
};
