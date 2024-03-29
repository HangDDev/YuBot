const { SlashCommandBuilder } = require("discord.js")
const moment = require("moment");
require("moment-duration-format");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("See the uptime of the bot.")
    .setDMPermission(true),
    async execute(interaction) {
        const duration = moment.duration(interaction.client.uptime).format("D [days], H [hrs], m [mins], s [secs]");
        const upvalue = (Date.now() / 1000 - interaction.client.uptime / 1000).toFixed(0);

        const embed = interaction.client.embed({
            authorName: `${interaction.client.user.username} ~ Uptime`,
            authorIcon: interaction.client.user.displayAvatarURL(),
            color: "Green"
        },
        { name: `${interaction.client.emoji.up} | Uptime`, value: `${duration}`, inline: true },
        { name: `${interaction.client.emoji.clock} | Up Since`, value: `<t:${upvalue}>`, inline: true })

        await interaction.reply({ embeds: [embed] })
    }
}