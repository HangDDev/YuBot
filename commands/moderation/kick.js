const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kicks a user.")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to kick")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for kicking the user")
        .setRequired(true)
    )
    .addAttachmentOption((option) =>
      option
        .setName("picture")
        .setDescription("Attach a picture file for reason of kicking")
        .setRequired(false)
    ),

  async execute(interaction) {
    const kick = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const picture = interaction.options.getAttachment("picture");

    const Permission = interaction.client.checkBotPerm(interaction.guild, PermissionFlagsBits.KickMembers)

    if (!Permission) {
      const embed = interaction.client.noPermEmbed({
        permission: interaction.client.readableBitField(PermissionFlagsBits.KickMembers)
      })
      return interaction.reply({ embeds: [embed] })
    }

    const kickConfirmationEmbed = interaction.client.embed(
      {
        title: `🔨 Kick Confirmation`,
        description: `**${interaction.user}** requests to kick **${kick}**.\n\nReason: ${reason}\n\n*This action is irreversible.*\nPlease confirm or cancel this action below.`,
        thumbnail: kick.displayAvatarURL(),
        footerText: interaction.client.user.username,
      },
      { name: "User", value: `${kick} (${kick.id})`, inline: true },
      { name: "Moderator", value: `${interaction.user} (${interaction.user.id})`, inline: true }
    );

    if (picture) {
      kickConfirmationEmbed.addFields({ name: 'Related Image:', value: '👇 See below 👇' });
      kickConfirmationEmbed.setImage(picture.url)
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("confirm_kick")
        .setLabel("Confirm")
        .setEmoji("✔️")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("cancel_kick")
        .setLabel("Cancel")
        .setEmoji("✖️")
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      embeds: [kickConfirmationEmbed],
      components: [row],
    });

    const filter = (i) => {
      return (
        ["confirm_kick", "cancel_kick"].includes(i.customId) &&
        i.user.id === interaction.user.id
      );
    };

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 15000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "confirm_kick") {
        await handleConfirmKick(i, kick, reason, picture);
      } else if (i.customId === "cancel_kick") {
        await handleCancelKick(i);
      }
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        interaction.editReply({
          content: "No response. Kick cancelled.",
          embeds: [],
          components: [],
        });
      }
    });
  },
};

async function handleConfirmKick(i, userToKick, reason, picture) {
  try {
    const dmEmbed = new EmbedBuilder()
      .setColor("#ff5555")
      .setTitle(`You've been kicked from ${i.guild.name}`)
      .setThumbnail(i.guild.iconURL())
      .addFields(
        { name: "Kicked by", value: i.user.tag },
        { name: "Reason", value: reason }
      )
      .setTimestamp();

    if (picture) {
      dmEmbed.addFields({ name: 'Related Image:', value: '👇 See below 👇' });
      dmEmbed.setImage(picture.url)
    }
    
    await userToKick
      .send({ embeds: [dmEmbed] })
      .catch((error) =>
        console.error(`Could not send DM to ${userToKick.tag}.`, error)
      );

    const kickConfirmationEmbed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("Kick Successful")
      .setDescription(`**${userToKick.tag}** has been kicked from the server.`)
      .addFields({ name: "Reason", value: reason })
      .setTimestamp()
      .setFooter({
        text: `Kicked by ${i.user.tag}`,
        iconURL: i.user.displayAvatarURL(),
      });

    if (picture) {
      kickConfirmationEmbed.addFields({ name: 'Related Image:', value: '👇 See below 👇' });
      kickConfirmationEmbed.setImage(picture.url)
    }

    await i.guild.members.kick(userToKick, {
      reason: `Kicked by ${i.user.tag}: ${reason}`,
    });
    await i.reply({ content: "", embeds: [kickConfirmationEmbed] });
  } catch (error) {
    const errorEmbed = new EmbedBuilder()
      .setColor("#ff0000")
      .setTitle("Kick Failed")
      .setDescription(`Failed to kick **${userToKick.tag}** from the server.\n\n**Reasons which may cause this problem**\nThe user you want to kick may have higher role level than me or is the server owner.`)
      .setTimestamp()
      .setFooter({
        text: i.client.user.username,
        iconURL: i.client.user.displayAvatarURL(),
      });
    await i.reply({ content: "", embeds: [errorEmbed] });
  }
}

async function handleCancelKick(i) {
  const cancelEmbed = new EmbedBuilder()
    .setColor("#ffff00")
    .setTitle("Kick Cancelled")
    .setDescription("The kick operation has been cancelled.")
    .setTimestamp()
    .setFooter({
      text: `Cancelled by ${i.user.tag}`,
      iconURL: i.user.displayAvatarURL(),
    });

  await i.reply({ content: "", embeds: [cancelEmbed] });
}
