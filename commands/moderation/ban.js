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
      .setDMPermission(false)
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
      const member = await interaction.guild.members.fetch(ban.id)
      const Permission = interaction.client.checkBotPerm(interaction.guild, PermissionFlagsBits.BanMembers)
  
      if (!Permission) {
        const embed = interaction.client.botNoPermEmbed({
          permission: interaction.client.readableBitField(PermissionFlagsBits.BanMembers)
        })
        return interaction.reply({ embeds: [embed], ephemeral: true })
      }

      if (!member.bannable) {
        const embed = interaction.client.embed({
          title: `${interaction.client.emoji.no} | Not bannable`,
          description: `The user ${ban} is not bannable!`,
          thumbnail: ban.displayAvatarURL(),
          footerText: interaction.client.user.username,
        })
  
        return await interaction.reply({ embeds: [embed], ephemeral: true })
      } else {
        const banConfirmationEmbed = interaction.client.embed(
          {
            title: `${interaction.client.emoji.ban} Ban Confirmation`,
            description: `**${interaction.user}** requests to ban **${ban}**.\n\n${interaction.client.emoji.arrow} | Reason: ${reason}\n\n${interaction.client.emoji.warn} | *This action is irreversible.*\nPlease confirm or cancel this action below.`,
            thumbnail: ban.displayAvatarURL(),
            footerText: interaction.client.user.username,
          },
          { name: `${interaction.client.emoji.member} User`, value: `${ban} (${ban.id})`, inline: true },
          { name: `${interaction.client.emoji.moderator} Moderator`, value: `${interaction.user} (${interaction.user.id})`, inline: true }
        );
    
        if (picture) {
          banConfirmationEmbed.addFields({ name: 'Related Image:', value: '👇 See below 👇' });
          banConfirmationEmbed.setImage(picture.url)
        }
    
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("confirm_ban")
            .setLabel("Confirm")
            .setEmoji(`${interaction.client.emoji.yes}`)
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId("cancel_ban")
            .setLabel("Cancel")
            .setEmoji(`${interaction.client.emoji.no}`)
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
              content: `${interaction.client.emoji.no} | No response. Ban cancelled.`,
              embeds: [],
              components: [],
            });
          }
        });
      }
    },
  };
  
  async function handleConfirmBan(i, userToBan, reason, picture) {
    try {
      const dmEmbed = new EmbedBuilder()
        .setColor("#ff5555")
        .setTitle(`${i.client.emoji.ban} | You've been banned from ${i.guild.name}`)
        .setThumbnail(i.guild.iconURL())
        .addFields(
          { name: `${i.client.emoji.moderator} Banned by`, value: i.user.tag },
          { name: `${i.client.emoji.arrow} Reason`, value: reason }
        )
        .setTimestamp();
      
      if (picture) {
        dmEmbed.addFields({ name: 'Related Image:', value: '👇 See below 👇' });
        dmEmbed.setImage(picture.url)
      }

      let dmed
      try {
        userToBan.send({ embeds: [dmEmbed] })
        dmed = true
      } catch(err) {
        dmed = false
      }
  
      const banConfirmationEmbed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Ban Successful")
        .setDescription(`**${userToBan.tag}** has been banned from the server.`)
        .addFields({ name: `${i.client.emoji.arrow} Reason`, value: reason })
        .setTimestamp()
        .setFooter({
          text: `Banned by ${i.user.tag}`,
          iconURL: i.user.displayAvatarURL(),
        });
  
      await i.guild.members.ban(userToBan, {
        reason: `Banned by ${i.user.tag}: ${reason}`,
      });
      if (dmed) {
        banConfirmationEmbed.addFields({ name: `Process`, value: `${interaction.client.emoji.arrow} Kick user: ${interaction.client.emoji.yes}\n${interaction.client.emoji.arrow} DM user: ${interaction.client.emoji.yes}`})
      } else {
        banConfirmationEmbed.addFields({ name: `Process`, value: `${interaction.client.emoji.arrow} Kick user: ${interaction.client.emoji.yes}\n${interaction.client.emoji.arrow} DM user: ${interaction.client.emoji.no}`})

      }
      await i.reply({ content: "", embeds: [banConfirmationEmbed] });
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle(`${i.client.emoji.no} Ban Failed`)
        .setDescription(`Failed to ban **${userToBan.tag}** from the server.`)
        .setTimestamp()
        .setFooter({
          text: "An error occurred",
          iconURL: i.client.user.displayAvatarURL(),
        });
      await i.reply({ content: "", embeds: [errorEmbed], ephemeral: true });
    }
  }
  
  async function handleCancelBan(i) {
    const cancelEmbed = new EmbedBuilder()
      .setColor("#ffff00")
      .setTitle(`${i.client.emoji.yes} Ban Cancelled`)
      .setDescription("The ban operation has been cancelled.")
      .setTimestamp()
      .setFooter({
        text: `Cancelled by ${i.user.tag}`,
        iconURL: i.user.displayAvatarURL(),
      });
  
    await i.reply({ content: "", embeds: [cancelEmbed] });
  }