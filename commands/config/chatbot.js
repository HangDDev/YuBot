const { SlashCommandBuilder, ChannelType } = require("discord.js");
const ChatBot = require("../../schema/chatbot.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chatbot")
    .setDescription("Configuations of the chat bot channel.")
    .setDMPermission(false)
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
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand == "set") {
      const channel = interaction.options.getChannel("channel") || interaction.channel;

      const check = ChatBot.findOne({
        Guild: interaction.guild.id,
        Channel: channel.id,
      });
      if (check.Channel)
        return await interaction.reply({
          content: `The chat bot channel is already setted in this server!`,
        });
      const Chatbot = await ChatBot.create({
        Guild: interaction.guild.id,
        Channel: channel.id,
      });

      const embed = interaction.client.embed({
        authorName: interaction.client.user.username,
        authorIcon: interaction.client.user.displayAvatarURL(),
        title: `✅ | Successful`,
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
    } else if (subcommand == "reset") {
      const check = await ChatBot.findOne({ Guild: interaction.guild.id });

      if (!check)
        return await interaction.reply({
          content: `Chat bot channel is not setted in this server!`,
        });

      const deleted = await ChatBot.deleteOne({ Guild: interaction.guild.id });
      const embed = interaction.client.embed(
        {
          authorName: interaction.client.user.username,
          authorIcon: interaction.client.user.displayAvatarURL(),
          title: `✅ | Successful`,
          description: `Successfully resetted chat bot channel.`,
        },
        { name: `📂 | Original Channel`, value: `<#${check.Channel}>` }
      );

      await interaction.reply({ embeds: [embed] });
    }
  },
};
