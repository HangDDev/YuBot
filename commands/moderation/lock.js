const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock a channel.")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to lock.")
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
      interaction.guild.roles.cache.find((role) => role.name === "@everyone"), { SendMessages: false }
    );

    const embed = interaction.client.embed(
      { description: "**🔒 Channel Locked**" },
      { name: `🔗 Channel`, value: `${channel} (${channel.name} - ${channel.id})` }
    );

    await interaction.reply({ embeds: [embed] });
  },
};
