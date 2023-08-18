const config = require("./config.json");
const { google } = require("googleapis");
const db = require("easy-db-json");
const vidData = require("vid_data");
const swearjar = require("swearjar");
const { chat } = require("googleapis/build/src/apis/chat");

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
  await insertMessage(`Command ${command} added!`);
  return true;
};

const ModServices = async (res) => {
  setInterval(async () => {
    const { data } = res;

    if (!messages[0]) messages = data.items;

    messages = messages.map(async (e) => {
      if (!e.checked) {
        const { snippet } = e;
        const { displayMessage, authorChannelId } = snippet;

        const words = displayMessage.split(" ");

        words.forEach(async (word) => {
          if (bannedWords.includes(word) || isBadWord(word)) {
            // word no longer looks like a word xD
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
            console.log("adding command");
            const newCommand = displayMessage.split(" ")[1];
            const newResponse = displayMessage.split(" ").slice(2).join(" ");
            await addCommand(newCommand, newResponse);
            await insertMessage("Command added!");
          }

          e.checked = true;
          return e;
        }
      }
    }, intervalTime);
  });
};

/**
 *
 * @param {Message} messageObj
 * @returns
 */
async function mod(messageObj) {
  // const MsgString = MsgToFunc.toString();
  // const words = MsgString.split(" ");
  // words.forEach(async (word) => {
  //   if (bannedWords.includes(word) || isBadWord(word)) {
  //     // word no longer looks like a word xD
  //     console.log(`banned word used: ${word}`);

  //     const channelName = vidData
  //       .get_channel_id_and_name(
  //         `https://youtube.com/channel/${authorChannelId}`
  //       )
  //       .then((data) => data.channel_name);

  //     await insertMessage(`@${channelName} That word is not allowed to use!`);
  //   }
  // });
  const message = messageObj.snippet.displayMessage;
  if (containsBadWords(message)) {
    return await await insertMessage(
      `@${messageObj.snippet.authorChannelId} That word is not allowed to use!`
    );
  }

  if (message.startsWith("!")) {
    const fragments = message.split(" ");
    const command = fragments[0].slice(1);

    switch (command) {
      case "addCommand":
        console.log("adding command");
        const newCommand = fragments[1];
        const newResponse = fragments[2];

        console.log(`${newCommand}: ${newResponse}`);

        await addCommand(newCommand, newResponse);
        await insertMessage(
          `@${messageObj.snippet.authorChannelId} Command added!`
        );
        return;
    }

    const response = db.get(command);
    if (response) {
      await insertMessage(response);
    }
  }
  return;
}

async function startModServices() {
  setInterval(() => {
    for (const message of chatMessages) {
      mod(message);
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
  ModServices,
  startModServices,
};
