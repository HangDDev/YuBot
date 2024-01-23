const { ActionRowBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle , PermissionFlagsBits, ChannelType } = require("discord.js");

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
      const embed = interaction.client.botNoPermEmbed({
        permission: interaction.client.readableBitField(PermissionFlagsBits.ManageChannels)
      })
      return interaction.reply({ embeds: [embed], ephemeral: true })
    }

    await channel.permissionOverwrites.edit(
      interaction.guild.roles.cache.find((role) => role.name === "@everyone"), { SendMessages: false }
    );
    await channel.permissionOverwrites.edit(
      interaction.client.user, { SendMessages: true }
    );

    const embed = interaction.client.embed(
      { description: `**${interaction.client.emoji.lock} Channel Locked**` },
      { name: `${interaction.client.emoji.channel} Channel`, value: `${channel} (${channel.name} - ${channel.id})`, inline: true },
      { name: `${interaction.client.emoji.moderator} Moderator`, value: `${interaction.user} (${interaction.user.username} - ${interaction.user.id})`}
    );

    const lock = new ButtonBuilder()
    .setCustomId(`lock`)
    .setLabel(`Lock`)
    .setEmoji(`${interaction.client.emoji.lock}`)
    .setStyle(ButtonStyle.Danger)

    const unlock = new ButtonBuilder()
    .setCustomId(`unlock`)
    .setLabel(`Unlock`)
    .setEmoji(`${interaction.client.emoji.unlock}`)
    .setStyle(ButtonStyle.Success)

    const row = new ActionRowBuilder()
    .addComponents(lock, unlock);

    await interaction.reply({ content: `${interaction.client.emoji.yes} | Channel locked successfully!`, ephemeral: true });
    await channel.send({ embeds: [embed], components: [row] })
    
  },
};
