const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, SlashCommandBuilder, REST, Routes } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Channel]
});

const TOKEN = process.env.TOKEN;      // bot token
const TARGET_GUILD_ID = "1451303050303115315"; // server to invite into
const TARGET_CHANNEL_ID = "1465131704334286959"; // a text/voice channel bot can create invites in
client.once(Events.ClientReady, () => {
  console.log(`Bot ready as ${client.user.tag}`);
});

// register slash command
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "getentry") {
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("one_time_invite")
          .setLabel("Get Entry Invite")
          .setStyle(ButtonStyle.Primary)
      );

    await interaction.reply({ content: "Click below for your invite:", components: [row], ephemeral: true });
  }
});

// handle button interaction
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "one_time_invite") return;

  try {
    // create a 1-use invite
    const targetGuild = await client.guilds.fetch(TARGET_GUILD_ID);
    const channel = await targetGuild.channels.fetch(TARGET_CHANNEL_ID);

    const invite = await channel.createInvite({
      maxUses: 1,
      unique: true,
      reason: `One time invite for ${interaction.user.tag}`
    });

    await interaction.user.send(`Here’s your invite:\n${invite.url}`);
    await interaction.reply({ content: "Invite sent to your DMs!", ephemeral: true });

  } catch (err) {
    console.error(err);
    await interaction.reply({ content: "Failed to create or DM invite. Check permissions.", ephemeral: true });
  }
});

client.login(TOKEN);
