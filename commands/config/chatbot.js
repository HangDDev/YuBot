const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const ChatBot = require("../../schema/chatbot.js");
const GuildSettings = require("../../schema/guildSetting.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chatbot")
    .setDescription("Configurations of the chat bot channel.")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("Sets the chat bot channel")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel to start chat bot")
            .addChannelTypes(
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement
            )
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("reset").setDescription("Resets the chat bot channel")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("turn").setDescription("Turn on/off the chat bot system").addBooleanOption(option => option.setName("turn").setDescription("True: on, false: off").setRequired(true))
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand == "set") {
      const channel = interaction.options.getChannel("channel") || interaction.channel;

      const check = await ChatBot.findOne({
        Guild: interaction.guild.id,
        Channel: channel.id,
      });
      if (check) {
        const reset = new ButtonBuilder()
        .setCustomId(`chatbot-reset`)
        .setLabel(`Reset`)
        .setEmoji(`🔁`)
        .setStyle(ButtonStyle.Danger)

        const row = new ActionRowBuilder()
        .addComponents(reset);
        return await interaction.reply({
          content: `${interaction.client.emoji.no} | The chat bot channel is already setted in this server!`,
          components: [row]
        });
      }
      const Chatbot = await ChatBot.create({
        Guild: interaction.guild.id,
        Channel: channel.id,
      });

      const embed = interaction.client.embed({
        authorName: interaction.client.user.username,
        authorIcon: interaction.client.user.displayAvatarURL(),
        title: `${interaction.client.emoji.yes} | Successful`,
        description: `Successfully setted chat bot channel as ${channel}.`,
        footerText: interaction.client.user.username,
      });
      const embed2 = interaction.client.embed({
        authorName: interaction.client.user.username,
        authorIcon: interaction.client.user.displayAvatarURL(),
        title: `🤖 | Chat Bot`,
        description: `This channel is setted as chat bot channel. You can now start having conversation with GPT in this channel.`,
        footerText: interaction.client.user.username,
      });

      await interaction.reply({ embeds: [embed] });
      await channel.send({ embeds: [embed2] });
      const settings = await GuildSettings.findOne({ Guild: interaction.guild.id })
      if (!settings) {
        const data = await GuildSettings.create({ Guild: interaction.guild.id, ChatBot: true })
      } else {
        await GuildSettings.updateOne({ Guild: interaction.guild.id, ChatBot: true })
      }
    } else if (subcommand == "reset") {
      const check = await ChatBot.findOne({ Guild: interaction.guild.id });

      if (!check)
        return await interaction.reply({
          content: `${interaction.client.emoji.no} | Chat bot channel is not setted in this server!`,
        });

      const deleted = await ChatBot.deleteOne({ Guild: interaction.guild.id });
      const embed = interaction.client.embed(
        {
          authorName: interaction.client.user.username,
          authorIcon: interaction.client.user.displayAvatarURL(),
          title: `${interaction.client.emoji.yes} | Successful`,
          description: `Successfully resetted chat bot channel.`,
        },
        { name: `${interaction.client.emoji.channel} | Original Channel`, value: `<#${check.Channel}>` }
      );

      await interaction.reply({ embeds: [embed] });
      const settings = await GuildSettings.findOne({ Guild: interaction.guild.id })
      if (!settings) {
        const data = await GuildSettings.create({ Guild: interaction.guild.id, ChatBot: false })
      } else {
        await GuildSettings.updateOne({ Guild: interaction.guild.id, ChatBot: false })
      }
    } else if (subcommand == "turn") {
      const turn = interaction.options.getBoolean("turn")
      const data = await ChatBot.findOne({ Guild: interaction.guild.id })
      if (!data) {
        const embed = interaction.client.embed({
          authorName: interaction.client.user.username,
          authorIcon: interaction.client.user.displayAvatarURL(),
          description: `${interaction.client.emoji.warn} Chat bot channel is not setted in this server!`
        })
        return await interaction.reply({ embeds: [embed] })
      }
      const channel = interaction.guild.channels.cache.get(data.Channel)
      try {
        await ChatBot.updateOne({ Guild: interaction.guild.id }, { Turn: turn})
        const embed = interaction.client.embed({
          authorName: interaction.client.user.username,
          authorIcon: interaction.client.user.displayAvatarURL(),
          description: `${interaction.client.emoji.yes} Successfully turned chat bot system to **__${turn ? "on" : "off"}__**`
        })
        await interaction.reply({ embeds: [embed], ephemeral: true })
        if (channel) {
          const embed = interaction.client.embed({
            authorName: interaction.client.user.username,
            authorIcon: interaction.client.user.displayAvatarURL(),
            description: `Chat bot system is turned to **__${turn ? "on" : "off"}__** by ${interaction.user}`
          })
          await channel.send({ embeds: [embed] })
        }
      } catch(err) {
        console.error(err)
        const embed = interaction.client.embed({
          authorName: interaction.client.user.username,
          authorIcon: interaction.client.user.displayAvatarURL(),
          description: `${interaction.client.emoji.warn} Something went wrong while updating the configuration! Try again later or join my [support server](${interaction.client.config.links.support}) for more help.`
        })
        await interaction.reply({ embeds: [embed], ephemeral: true })
      }
    }
  },
};
