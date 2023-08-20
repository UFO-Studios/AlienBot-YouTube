const youtube = require("../youtubeService");
const quote = require("./quote");
const uptime = require("./uptime");
const db = require("easy-db-json");

db.setFile("../db.json");

/**
 * @param {string} message
 */
async function handleCommand(message, channelId, yt, chatMessages) {
  console.log(message);
  const fragments = message.split(" ");
  const command = fragments[0];

  switch (command.toLowerCase()) {
    case "addcommand":
      console.log("adding command");
      const newCommand = fragments[1];
      const newResponse = fragments[2];

      console.log(`${newCommand}: ${newResponse}`);

      await addCommand(newCommand, newResponse);
      const { data } = await yt.channels.list({
        part: "snippet",
        id: channelId,
        auth,
      });

      await insertMessage(`${data.items[0].snippet.customUrl} Command added!`);
      break;
    case "uptime":
      uptime();
      break;
    case "quote":
      quote();
      break;
    case "whoisfirst":
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

      await youtube.insertMessage(
        `${data1.items[0].snippet.customUrl} The first person in chat is: ${data2.items[0].snippet.customUrl}!`
      );

      break;
    default:
      const response = db.get(command);

      if (response) {
        await youtube.insertMessage(response);
      }
      break;
  }

  return true;
}

module.exports = handleCommand;
