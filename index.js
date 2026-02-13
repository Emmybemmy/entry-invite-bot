const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, SlashCommandBuilder, REST, Routes } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Channel]
});

const TOKEN = process.env.TOKEN;      // bot token
const TARGET_GUILD_ID = "1457819654658719804"; // server to invite into
const TARGET_CHANNEL_ID = "1468709189168664843"; // a text/voice channel bot can create invites in
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

// Button handler (LIMITED TO ONE INVITE PER USER)
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "one_time_invite") return;

  await interaction.deferReply({ ephemeral: true });

  const userId = interaction.user.id;

  // Read file
  let usedUsers = [];
  try {
    usedUsers = JSON.parse(fs.readFileSync('./usedUsers.json', 'utf8'));
  } catch {
    usedUsers = [];
  }

  // If user already received invite
  if (usedUsers.includes(userId)) {
    return interaction.editReply({
      content: "❌ You have already received your one-time invite."
    });
  }

  try {
    const targetGuild = await client.guilds.fetch(TARGET_GUILD_ID);
    const channel = await targetGuild.channels.fetch(TARGET_CHANNEL_ID);

    const invite = await channel.createInvite({
      maxUses: 1,
      unique: true,
      reason: `One time invite for ${interaction.user.tag}`
    });

    // Save user to file
    usedUsers.push(userId);
    fs.writeFileSync('./usedUsers.json', JSON.stringify(usedUsers, null, 2));

    await interaction.user.send(`Here’s your one-time invite:\n${invite.url}`);

    await interaction.editReply({
      content: "📩 Invite sent to your DMs!"
    });

  } catch (err) {
    console.error(err);
    await interaction.editReply({
      content: "❌ Failed to create or DM invite. Check permissions."
    });
  }
});

client.login(TOKEN);