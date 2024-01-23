const { Events, PermissionFlagsBits } = require("discord.js");
const ChatBot = require("../../schema/chatbot.js")

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction) {
    if (!interaction.isButton()) return;

    if (interaction.customId == "chatbot-reset") {
      const Permission = interaction.client.checkUserPerm(
        interaction.member,
        PermissionFlagsBits.ManageGuild
      );

      if (!Permission) {
        const embed = interaction.client.userNoPermEmbed({
          permission: interaction.client.readableBitField(PermissionFlagsBits.ManageGuild),
        });
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
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
    }
  },
};
