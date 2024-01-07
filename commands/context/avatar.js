const { ContextMenuCommandBuilder, ApplicationCommandType } = require("discord.js")

module.exports = {
    data: new ContextMenuCommandBuilder()
    .setName("getAvatar")
    .setType(ApplicationCommandType.User),
    async execute(interaction) {
        const embed = interaction.client.embed({
            authorName: interaction.user.username,
            authorIcon: interaction.user.displayAvatarURL(),
            description: `Avatar of ${interaction.user}`,
            image: `${interaction.user.displayAvatarURL()}`
        })

        await interaction.reply({ embeds: [embed] })
    }
}