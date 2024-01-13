const { profileImage } = require("discord-arts")
const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Gets the information of a user.")
    .setDMPermission(false)
    .addUserOption(option => option.setName("user").setDescription("The user you want to get information about.").setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply()
        const user = interaction.options.getUser("user") || interaction.user
        const member = await interaction.guild.members.fetch(user.id)
        const nickname = member.nickname ?? "None"
        const booster = member.premiumSince ? `<:boost:1195608003882258493> (Boost since <t:${parseInt(member.premiumSinceTimeStamp / 1000)}:R>` : "<:cross:1195642757260263508>"
        const joinDiscord = `<t:${parseInt(user.createdAt / 1000)}:R>`
        const joinServer = `<t:${parseInt(member.joinedAt / 1000)}:R>`
        const status = member.presence ? member.presence.status : "offline";
        const profileBuffer = await profileImage(user.id, {
            badgesFrame: true,
            presenceStatus: `${status}`,
            removeAvatarFrame: false
        });

        const profileAttachment = new AttachmentBuilder()
        .setName("profile.png")
        .setFile(profileBuffer)

        const embed = interaction.client.embed({
            authorName: user.username,
            authorIcon: member.displayAvatarURL(),
            image: "attachment://profile.png",
        }, { name: `🔧 **__General Information__**`, value: `**Username:** ${user.username}\n**Nickname:** ${nickname}\n**ID:** ${user.id}\n**Joined Discord:** ${joinDiscord}\n**Joined Server**: ${joinServer}\n**Bot User:** ${user.bot ? "<:tick:1195642973552119860>" : "<:cross:1195642757260263508>"}\n**Booster:** ${booster}` })

        await interaction.editReply({ embeds: [embed], files: [profileAttachment] })
    }
}