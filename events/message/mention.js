const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) return
        if (message.content.includes(`<@${message.client.user.id}>`)) {
            
        const invite = new ButtonBuilder()
        .setEmoji("➕")
        .setURL(`${message.client.config.links.invite}`)
        .setLabel("Invite")
        .setStyle(ButtonStyle.Link)

        const support = new ButtonBuilder()
        .setEmoji(`${message.client.emoji.link}`)
        .setURL(`${message.client.config.links.support}`)
        .setLabel("Support")
        .setStyle(ButtonStyle.Link)

        const row = new ActionRowBuilder()
        .setComponents(invite, support)

        const embed = message.client.embed({
            authorName: message.client.user.username,
            authorIcon: message.client.user.displayAvatarURL(),
            description: `Hey ${message.author}! Here are some information about me!\n\nI am a Discord bot made in JavaScript with the library Discord.js. I am made for improving servers with different system including advanced moderations, utilities and AI tools.\n\n**__Want to get list of my command?__**\n${message.client.emoji.arrow} </help:1192506151003242568>\n**__Want to get more information about me?__**\n${message.client.emoji.arrow} </botinfo:1189534392872357998>`,
            footerText: message.client.user.username
        })

        await message.reply({ embeds: [embed], components: [row] })
        }
    }
}