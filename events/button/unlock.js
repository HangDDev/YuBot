const { Events, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return

        if (interaction.customId == "unlock") {
            const userPermission = interaction.client.checkUserPerm(interaction.member, PermissionFlagsBits.ManageChannels)

        if (!userPermission) {
            const embed = interaction.client.userNoPermEmbed({
              permission: interaction.client.readableBitField(PermissionFlagsBits.ManageChannels)
            })
            return interaction.reply({ embeds: [embed], ephemeral: true })
          }
          const botPermission = interaction.client.checkBotPerm(interaction.guild, PermissionFlagsBits.ManageChannels)

          if (!botPermission) {
              const embed = interaction.client.botNoPermEmbed({
                permission: interaction.client.readableBitField(PermissionFlagsBits.ManageChannels)
              })
              return interaction.reply({ embeds: [embed], ephemeral: true })
            }
              
              await interaction.channel.permissionOverwrites.edit(
                  interaction.guild.roles.cache.find((role) => role.name === "@everyone"), { SendMessages: true }
              );
              await interaction.channel.permissionOverwrites.edit(
                interaction.client.user, { SendMessages: true }
              );

              const embed = interaction.client.embed(
                { description: "**🔒 Channel Unlocked**" },
                { name: `📂 Channel`, value: `${interaction.channel} (${interaction.channel.name} - ${interaction.channel.id})` },
                { name: `⚒️ Moderator`, value: `${interaction.user} (${interaction.user.username} - ${interaction.user.id})` }
              );
          
              const lock = new ButtonBuilder()
              .setCustomId(`lock`)
              .setLabel(`Lock`)
              .setEmoji(`🔒`)
              .setStyle(ButtonStyle.Danger)
          
              const unlock = new ButtonBuilder()
              .setCustomId(`unlock`)
              .setLabel(`Unlock`)
              .setEmoji(`🔓`)
              .setStyle(ButtonStyle.Success)
          
              const row = new ActionRowBuilder()
              .addComponents(lock, unlock);
          
              await interaction.reply({ content: `Channel unlocked successfully!`, ephemeral: true });
              await interaction.channel.send({ embeds: [embed], components: [row] })
        }
    }
}