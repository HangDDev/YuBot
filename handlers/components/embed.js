const { EmbedBuilder } = require("discord.js")

module.exports = (client) => {
    client.simpleEmbed = ({
        interaction = null,
        description = description,
        color = "Blue"
    }, {} ) => {
        return new EmbedBuilder()
        .setAuthor({
             name: interaction.user.username ?? client.user.username,
             iconURL: interaction.user.displayAvatarURL() ?? client.user.displayAvatarURL()
        })
        .setDescription(`${description}`)
        .setColor(`${color}`)
        .setFooter({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
    }

    client.embed = ({
        authorName = client.user.username,
        authorIcon = client.user.displayAvatarURL(),
        title,
        description,
        color = "Blue",
        footerText,
        footerIcon,
        thumbnail,
    } = {}, ...fields ) => {
        const embed = new EmbedBuilder()
        if (authorName && authorIcon) embed.setAuthor({ name: authorName , iconURL: authorIcon })
        if (title) embed.setTitle(title)
        if (description) embed.setDescription(description)
        if (footerIcon && !footerText) throw new Error(`Cannot add a footer with footer icon but without footer text!`)
        if (footerText && footerIcon) embed.setFooter({ text: footerText, iconURL: footerIcon })
        if (footerText) embed.setFooter({ text: footerText })
        if (thumbnail) embed.setThumbnail(thumbnail)
        embed.setColor(color)
    
        for (let field of fields) {
            if ((field.name && !field.value) || (field.name && field.value.length <= 0)) throw new Error(`Cannot add a field with name but without value!`)
            if ((!field.name && field.value) || (field.name.length <= 0 && field.value)) throw new Error(`Cannot add a field with value but without name!`)
        }
        if (fields.length > 25) throw new Error(`Cannot add more than 25 fields in an embed!`)
        if (fields.length > 0) embed.addFields(fields)
        return embed
    }
}