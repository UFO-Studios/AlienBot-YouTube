require("dotenv").config();
const { google } = require("googleapis");
const db = require("easy-db-json");

db.setFile("./db.json");

const youtube = google.youtube("v3");
const OAuth2 = google.auth.OAuth2;

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectURI = "http://localhost:3000/callback";
const scope = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.force-ssl",
];

let liveChatId;
let nextPage;
const intervalTime = 3000;
let interval;
const chatMessages = [];

const auth = new OAuth2(clientId, clientSecret, redirectURI);

auth.on("tokens", (tokens) => db.set("tokens", tokens));

const youtubeService = {};

youtubeService.getCode = (res) => {
  const authUrl = auth.generateAuthUrl({
    access_type: "offline",
    scope,
  });
  res.redirect(authUrl);
};

youtubeService.auth = ({ tokens }) => {
  auth.setCredentials(tokens);
  console.log("successfully set credentials.");
  console.log(tokens);
  db.set("tokens", tokens);
};

youtubeService.getToken = async (code) => {
  const credentials = await auth.getToken(code);
  youtubeService.auth(credentials);
};

youtubeService.findChat = async () => {
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
    youtubeService.insertMessage("Hello everyone!");
  } catch (error) {
    console.log(error);
  }
};

youtubeService.insertMessage = async (messageText = "hello world") => {
  await youtube.liveChatMessages.insert({
    auth,
    part: "snippet",
    resource: {
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

const bw = [
  "titties",
  "kys",
  "turkroach",
  "mongloid",
  "orgies",
  "orgy",
  "niqpa",
  "gigga",
  "necrophiliac",
  "necrophilia",
  "corpsefucker",
  "jewpedo",
  "dyke",
  "xxxvids",
  "femboy",
  "slave",
  "brazzers",
  "kike",
  "jewnigger",
  "jewfag",
  "goy",
  "goyim",
  "coon",
  "faggot",
  "cunt",
  "spic",
  "tranny",
  "fapping",
  "subhuman",
  "aryan",
  "hitler",
  "natsoc",
  "beaner",
  "sandnigger",
  "nudes",
  "dickhead",
  "cocaine",
  "pussy",
  "fucktard",
  "gaylord",
  "libtard",
  "cuck",
  "cucklord",
  "gaylors",
  "orgasm",
  "sex",
  "cum",
  "niggur",
  "nignog",
  "cumsickle",
  "retard",
  "threesome",
  "foursome",
  "cunt",
  "condom",
  "WetAssPussy",
  "negro",
  "negros",
  "hore",
  "whore",
  "masturbating",
  "fag",
  "nigger",
  "nigga",
  "nibba",
  "niga",
  "n1gger",
  "n1gga",
  "cock",
  "cum",
  "vagina",
  "hentai",
  "penis",
  "milf",
  "porn",
  "pornhub",
  "pornhubpremium",
  "dildo",
  "rape",
  "anal",
  "clit",
  "dick",
  "pussy",
  "orgy",
  "gangbang",
  "hcodes",
  "fetish",
  "pedo",
  "pedophile",
  "porno",
  "pornos",
  "pussys",
  "pussies",
  "pornography",
  "pedophilia",
  "pedophilliac",
  "phonesex",
  "dildos",
  "fisting",
  "doggystyle",
];

// TODO:
youtubeService.startAutoMod = async () => {
  const res = await youtube.liveChatMessages.list({
    auth,
    part: "snippet",
    liveChatId,
    pageToken: nextPage,
  });

  const { data } = res;
  console.log(data);
};

youtubeService.stopTrackingChat = async () => {
  clearInterval(interval);
};

const getChatMessages = async () => {
  const res = await youtube.liveChatMessages.list({
    auth,
    part: "snippet",
    liveChatId,
    pageToken: nextPage,
  });

  const { data } = res;
  const newMessages = data.items;
  chatMessages.push(...newMessages);
  nextPage = data.nextPageToken;
  console.log(`total messages: ${chatMessages.length}`);
};

youtubeService.startTrackingChat = async () => {
  interval = setInterval(() => {
    getChatMessages();
  }, intervalTime);
};

youtubeService.startReadingChat = async () => {
  setInterval(() => console.log(chatMessages), 3100);
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

module.exports = youtubeService;
