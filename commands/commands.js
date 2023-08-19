const getChannelName = require("../utils/getChannelName");
const quote = require("./quote");
const uptime = require("./uptime");

/**
 * @param {string} message
 */
async function handleCommand(message, channelId) {
  const fragments = message.split(" ");
  const command = fragments[0];

  switch (command.toLowerCase()) {
    case "addcommand":
      console.log("adding command");
      const newCommand = fragments[1];
      const newResponse = fragments[2];

      console.log(`${newCommand}: ${newResponse}`);

      await addCommand(newCommand, newResponse);
      const { data } = await youtube.channels.list({
        part: "snippet",
        id: channelId,
        auth,
      });
      
      await insertMessage(`@${data.items[0].snippet.customUrl} Command added!`);
      break;
    case "uptime":
      uptime();
      break;
    case "quote":
      quote();
      break;
    default:
      const response = db.get(command);

      if (response) {
        await insertMessage(response);
      }
      break;
  }

  return true;
}

module.exports = handleCommand;
