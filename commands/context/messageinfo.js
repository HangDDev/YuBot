const { ContextMenuCommandBuilder, AttachmentBuilder, ApplicationCommandType } = require("discord.js")

module.exports = {
    data: new ContextMenuCommandBuilder()
    .setName("info")
    .setDMPermission(false)
    .setType(ApplicationCommandType.Message),
    async execute(interaction) {
        await interaction.deferReply()
        const message = interaction.targetMessage
        const id = message.id
        const content = message.content
        const characters = message.content.length
        const author = message.author
        const sent = `<t:${parseInt(message.createdAt / 1000)}:R>`

        const embed = interaction.client.embed({
            title: `Message Information`,
            authorName: author.username,
            authorIcon: author.displayAvatarURL(),
            description: content,
        }, { name: `${interaction.client.emoji.wrench} **__General Information__**`, value: `**Author:** ${author.username} (${author.id})\n**Sent:** ${sent}\n**Bot User:** ${author.bot ? "<:tick:1195642973552119860>" : "<:cross:1195642757260263508>"}\n**ID:** ${id}\n**Characters:** ${characters}` })

        await interaction.editReply({ embeds: [embed] })
    }
}