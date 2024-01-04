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
      .setName("ban")
      .setDescription("Bans a user.")
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("The user to ban")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("reason")
          .setDescription("Reason for banning the user")
          .setRequired(true)
      )
      .addAttachmentOption((option) =>
        option
          .setName("picture")
          .setDescription("Attach a picture file for reason of baning")
          .setRequired(false)
      ),
  
    async execute(interaction) {
      const ban = interaction.options.getUser("user");
      const reason = interaction.options.getString("reason");
      const picture = interaction.options.getAttachment("picture");
  
      const Permission = interaction.client.checkBotPerm(interaction.guild, PermissionFlagsBits.BanMembers)
  
      if (!Permission) {
        const embed = interaction.client.noPermEmbed({
          permission: interaction.client.readableBitField(PermissionFlagsBits.BanMembers)
        })
        return interaction.reply({ embeds: [embed] })
      }
  
      const banConfirmationEmbed = interaction.client.embed(
        {
          title: `🔨 Ban Confirmation`,
          description: `**${interaction.user}** requests to ban **${ban}**.\n\nReason: ${reason}\n\n*This action is irreversible.*\nPlease confirm or cancel this action below.`,
          thumbnail: ban.displayAvatarURL(),
          footerText: interaction.client.user.username,
        },
        { name: "User", value: `${ban} (${ban.id})`, inline: true },
        { name: "Moderator", value: `${interaction.user} (${interaction.user.id})`, inline: true }
      );
  
      if (picture) {
        banConfirmationEmbed.addFields({ name: 'Related Image:', value: '👇 See below 👇' });
        banConfirmationEmbed.setImage(picture.url)
      }
  
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("confirm_ban")
          .setLabel("Confirm")
          .setEmoji("✔️")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("cancel_ban")
          .setLabel("Cancel")
          .setEmoji("✖️")
          .setStyle(ButtonStyle.Secondary)
      );
  
      await interaction.reply({
        embeds: [banConfirmationEmbed],
        components: [row],
      });
  
      const filter = (i) => {
        return (
          ["confirm_ban", "cancel_ban"].includes(i.customId) &&
          i.user.id === interaction.user.id
        );
      };
  
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 15000,
      });
  
      collector.on("collect", async (i) => {
        if (i.customId === "confirm_ban") {
          await handleConfirmBan(i, ban, reason, picture);
        } else if (i.customId === "cancel_ban") {
          await handleCancelBan(i);
        }
      });
  
      collector.on("end", (collected) => {
        if (collected.size === 0) {
          interaction.editReply({
            content: "No response. Ban cancelled.",
            embeds: [],
            components: [],
          });
        }
      });
    },
  };
  
  async function handleConfirmBan(i, userToBan, reason, picture) {
    try {
      const dmEmbed = new EmbedBuilder()
        .setColor("#ff5555")
        .setTitle(`You've been banned from ${i.guild.name}`)
        .setThumbnail(i.guild.iconURL())
        .addFields(
          { name: "Banned by", value: i.user.tag },
          { name: "Reason", value: reason }
        )
        .setTimestamp();
      
      if (picture) {
        dmEmbed.addFields({ name: 'Related Image:', value: '👇 See below 👇' });
        dmEmbed.setImage(picture.url)
      }
  
      await userToBan
        .send({ embeds: [dmEmbed] })
        .catch((error) =>
          console.error(`Could not send DM to ${userToBan.tag}.`, error)
        );
  
      const banConfirmationEmbed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Ban Successful")
        .setDescription(`**${userToBan.tag}** has been banned from the server.`)
        .addFields({ name: "Reason", value: reason })
        .setTimestamp()
        .setFooter({
          text: `Banned by ${i.user.tag}`,
          iconURL: i.user.displayAvatarURL(),
        });
  
      await i.guild.members.ban(userToBan, {
        reason: `Banned by ${i.user.tag}: ${reason}`,
      });
      await i.reply({ content: "", embeds: [banConfirmationEmbed] });
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Ban Failed")
        .setDescription(`Failed to ban **${userToBan.tag}** from the server.`)
        .setTimestamp()
        .setFooter({
          text: "An error occurred",
          iconURL: i.client.user.displayAvatarURL(),
        });
      await i.reply({ content: "", embeds: [errorEmbed] });
    }
  }
  
  async function handleCancelBan(i) {
    const cancelEmbed = new EmbedBuilder()
      .setColor("#ffff00")
      .setTitle("Ban Cancelled")
      .setDescription("The ban operation has been cancelled.")
      .setTimestamp()
      .setFooter({
        text: `Cancelled by ${i.user.tag}`,
        iconURL: i.user.displayAvatarURL(),
      });
  
    await i.reply({ content: "", embeds: [cancelEmbed] });
  }