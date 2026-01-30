const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const TOKEN = "process.env.TOKEN";
const CLIENT_ID = "1466240082733432984";

const commands = [
  new SlashCommandBuilder()
    .setName("getentry")
    .setDescription("Get your one-time invite to the target server")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log("Slash command registered.");
  } catch (err) {
    console.error(err);
  }
})();
