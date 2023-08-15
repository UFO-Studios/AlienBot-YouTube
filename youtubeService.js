const config = require("./config.json");
const { google } = require("googleapis");
const db = require("easy-db-json");
const vidData = require("vid_data");

db.setFile("./db.json");

const youtube = google.youtube("v3");
const OAuth2 = google.auth.OAuth2;

const clientId = config.CLIENT_ID;
const clientSecret = config.CLIENT_SECRET;
const redirectURI = config.CALLBACK_DOMAIN+"/callback";

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

  console.log(chatMessages);
  return true;
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

const isBadWord = (word) => {
  const ProfanityEngine = require("@coffeeandfun/google-profanity-words").ProfanityEngine;
  const profanityEngine = new ProfanityEngine();
  return profanityEngine.search(word);
};


const addCommand = async (command, response) => {
  db.setFile("./commands.json")
  await db.set(command, response);
  await insertMessage(`@${channelName} Command ${command} added!`);
  db.setFile("./db.json")
  return true;
};

const startModServices = async () => {
  setInterval(async () => {
    const res = await youtube.liveChatMessages.list({
      auth,
      part: ["snippet"],
      liveChatId,
      pageToken: nextPage,
    });

    const { data } = res;

    if (!messages[0]) messages = data.items;

    messages = messages.map(async (e) => {
      if (!e.checked) {
        const { snippet } = e;
        const { displayMessage, authorChannelId } = snippet;

        const words = displayMessage.split(" ");

        words.forEach(async (word) => {
          if (bannedWords.includes(word) || isBadWord(word)) {// word no longer looks like a word xD
            console.log(`banned word used: ${word}`);

            const channelName = vidData
              .get_channel_id_and_name(
                `https://youtube.com/channel/${authorChannelId}`
              )
              .then((data) => data.channel_name);

            await insertMessage(
              `@${channelName} That word is not allowed to use!`
            );
          }
        });
        if (displayMessage.startsWith("!")) {
          const command = displayMessage.split(" ")[0].slice(1);
          const response = db.get(command);
          if (response) {
            await insertMessage(response);
          }
          if (command === "addCommand") {
            const newCommand = displayMessage.split(" ")[1];
            const newResponse = displayMessage.split(" ").slice(2).join(" ");
            await addCommand(newCommand, newResponse);
            await insertMessage("Command added!");
          }

        e.checked = true;
        return e;
      }
    };
  }, intervalTime);
})
};

checkTokens();

module.exports = {
  getCode,
  insertMessage,
  startChatTracking,
  stopChatTracking,
  findChat,
  getToken,
  startModServices,
};
