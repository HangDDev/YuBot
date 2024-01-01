const fs = require("node:fs");
const { REST, Routes } = require("discord.js");

commandHandler = async (client) => {
  const folders = fs.readdirSync("./commands/");
  for (const folder of folders) {
    const files = fs
      .readdirSync(`./commands/${folder}`)
      .filter((f) => f.endsWith(".js"));
    for (const file of files) {
      const command = require(`../../commands/${folder}/${file}`);
      if (command.data.name) {
        client.commandsArray.push(command.data.toJSON());
        client.commands.set(command.data.name, command);
      } else {
        console.log(`Name is not set in command ${file}!`);
      }
    }
  }

  const rest = new REST().setToken(client.config.bot.token);

  try {
    console.log(`Loading application (/) commands...`);
    const data = await rest.put(
      Routes.applicationCommands(client.config.bot.id),
      { body: client.commandsArray }
    )
    console.log(`Successfully loaded ${data.length} application (/) commands!`);
  } catch (error) {
    console.log(error)
  }
};

module.exports = commandHandler;
