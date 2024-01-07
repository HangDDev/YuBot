const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear 1-100 messages with one command")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount of messages you want to clear")
        .setRequired(true)
    ),
  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    const Permission = interaction.client.checkBotPerm(interaction.guild, PermissionFlagsBits.ManageMessages)
  
      if (!Permission) {
        const embed = interaction.client.botNoPermEmbed({
          permission: interaction.client.readableBitField(PermissionFlagsBits.ManageMessages)
        })
        return interaction.reply({ embeds: [embed], ephemeral: true })
      }

    if (amount > 100) {
        const embed = interaction.client.embed({
            authorName: interaction.client.user.username,
            authorIcon: interaction.client.user.displayAvatarURL(),
            title: `❌ Failed to clear!`,
            description: `Cannot clear more than 100 messages at a time!`
        })
        return await interaction.reply({ embeds: [embed], ephemeral: true })
    }

    if (amount < 1) {
        const embed = interaction.client.embed({
            authorName: interaction.client.user.username,
            authorIcon: interaction.client.user.displayAvatarURL(),
            title: `❌ Failed to clear!`,
            description: `Cannot clear less than 1 message!`
        })
        return await interaction.reply({ embeds: [embed], ephemeral: true })
    }

    interaction.channel.bulkDelete(amount + 1).then( async() => {
        const embed = interaction.client.embed({
            authorName: interaction.client.user.username,
            authorIcon: interaction.client.user.displayAvatarURL(),
            description: `Successfully cleared messages.`
        }, {
            name: "✉️ | Amount deleted", value: `${amount}`, inline: true
        })

        await interaction.reply({ embeds: [embed] })
    }).catch(async err => {
        const embed = interaction.client.embed({
            authorName: interaction.client.user.username,
            authorIcon: interaction.client.user.displayAvatarURL(),
            title: `❌ Failed to clear!`,
            description: `Something went wrong that I cannot clear messages!`
        })

        await interaction.reply({ embeds: [embed], ephemeral: true })
    })
  },
};
