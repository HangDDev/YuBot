const { ContextMenuCommandBuilder, ApplicationCommandType } = require("discord.js")

module.exports = {
    data: new ContextMenuCommandBuilder()
    .setName("getAvatar")
    .setDMPermission(false)
    .setType(ApplicationCommandType.User),
    async execute(interaction) {
        const embed = interaction.client.embed({
            authorName: interaction.targetUser.username,
            authorIcon: interaction.targetUser.displayAvatarURL(),
            description: `Avatar of ${interaction.targetUser}`,
            image: `${interaction.targetUser.displayAvatarURL()}`
        })

        await interaction.reply({ embeds: [embed] })
    }
}