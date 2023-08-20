const quote = require("./quote.js");
const uptime = require("./uptime.js");
const db = require("easy-db-json");
const about = require("./about.js");

db.setFile("../db.json");

/**
 * @param {string} message
 */
async function handleCommand(message, channelId, msg, yt, chatMessages, auth) {
  const fragments = message.split(" ");
  const command = fragments[0];

  switch (command.toLowerCase()) {
    case "addcommand" || "ac":
      const newCommand = fragments[1];
      const newResponse = fragments[2];

      console.log(`${newCommand}: ${newResponse}`);

      await addCommand(newCommand, newResponse);
      const { data } = await yt.channels.list({
        part: "snippet",
        id: channelId,
        auth,
      });

      await msg(`${data.items[0].snippet.customUrl} Command added!`);
      break;
    case "uptime":
    case "ut":
      uptime(msg);
      break;
    case "streamuptime":
    case "sut":
      const { data: datayt } = await yt.liveBroadcasts.list({
        part: "snippet",
        auth,
        mine: true,
      });

      const { snippet } = datayt.items[0];

      const timeStarting = new Date(snippet.actualStartTime).valueOf();
      const rn = new Date().valueOf();

      const milliseconds = rn - timeStarting; // in milliseconds
      const seconds = Math.floor(milliseconds / 1000); // in seconds
      const minutes = Math.floor(seconds / 60); // in minutes
      const hours = Math.floor(seconds / 3600); // in hours

      await msg(
        `The stream has been up since ${hours} hours, ${minutes} minutes and ${seconds} seconds. (Thats ${milliseconds} in milliseconds!)`
      );

      break;
    case "quote":
    case "qt":
      quote(msg);
      break;
    case "whoisfirst":
    case "wif":
      const { data: data1 } = await yt.channels.list({
        part: "snippet",
        id: channelId,
        auth,
      });

      const { data: data2 } = await yt.channels.list({
        part: "snippet",
        id: chatMessages[0].snippet.authorChannelId,
        auth,
      });

      await msg(
        `${data1.items[0].snippet.customUrl} The first person in chat is: ${data2.items[0].snippet.customUrl}!`
      );

      break;
    case "about":
    case "at":
      about(msg);
      break;
    default: // custom cmds
      const response = db.get(command);

      if (response) {
        await msg(response);
      }
      break;
  }

  return true;
}

module.exports = handleCommand;
