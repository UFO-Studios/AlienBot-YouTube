// Import the lib
const { LiveChat } = require("yt-livechat");
require('dotenv').config();

 
// Let's do some config
const config = {
    liveChatID: process.env.LIVE_CHAT_ID || "", // ID of the LiveChat
    oauth: { // OAuth2 keys from Google Developers Console
        client_id: process.env.CLIENT_ID || "",
        client_secret: process.env.CLIENT_SECRET || "",
        refresh_token: process.env.REFRESH_TOKEN || "",
    },
};
 
const chat = new LiveChat(config); // Init chat object
 
// Register some events
chat.on("connected", () => console.log("Connected to the YouTube API."));
chat.on("error", (error) => console.log(error));
 
chat.on("chat", (message) => {
    console.log(`New message from ${message.authorDetails.displayName}.`);
    if (message.snippet.displayMessage === "/hello") {
        chat.say("Hello world !");
    }
});
 
// Start polling messages
chat.connect();