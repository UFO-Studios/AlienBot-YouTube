const quote = require("./quote")
const uptime = require("./uptime")

async function handleCommand(message) {
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
        break;
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
}

module.exports = handleCommand