const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlock a channel.")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to unlock.")
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(false)
    ),
  async execute(interaction) {
    const channel =
      interaction.options.getChannel("channel") || interaction.channel;

    const Permission = interaction.client.checkBotPerm(interaction.guild, PermissionFlagsBits.ManageChannels)

    if (!Permission) {
      const embed = interaction.client.noPermEmbed({
        permission: interaction.client.readableBitField(PermissionFlagsBits.ManageChannels)
      })
      return interaction.reply({ embeds: [embed] })
    }
    
    await channel.permissionOverwrites.edit(
      interaction.guild.roles.cache.find((role) => role.name === "@everyone"), { SendMessages: true }
    );

    const embed = interaction.client.embed(
      { description: "**🔓 Channel Unlocked**" },
      { name: `🔗 Channel`, value: `${channel} (${channel.name} - ${channel.id})` }
    );

    await interaction.reply({ content: `Channel unlocked successfully!` });
    await channel.send({ embeds: [embed] })
  },
};
