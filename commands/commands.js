const quote = require("./quote")
const uptime = require("./uptime")

/**
 * @param {string} message
 */
async function handleCommand(message) {
    const fragments = message.split(" ");
    const command = fragments[0]

    switch (command.toLowerCase()) {
      case "addcommand":
        console.log("adding command");
        const newCommand = fragments[1];
        const newResponse = fragments[2];

        console.log(`${newCommand}: ${newResponse}`);

        await addCommand(newCommand, newResponse);
        await insertMessage(
          `@${messageObj.snippet.authorChannelId} Command added!`
        );
        break; //fancypants xD
      case "uptime":
        uptime()
        break
      case "quote":
        quote()
        break
      default:
        const response = db.get(command);
        
        if (response) {
          await insertMessage(response); // hello there
        }
    }

    return true
}

module.exports = handleCommand