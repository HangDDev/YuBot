const { SlashCommandBuilder, EmbedBuilder, Embed } = require("discord.js")
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

        const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.client.user.username} ~ Uptime`, iconURL: interaction.client.user.displayAvatarURL() })
        .addFields(
            { name: `⏱️ | Uptime`, value: `${duration}`, inline: true },
            { name: `⌛ | Up Since`, value: `<t:${upvalue}>`, inline: true }
        )
        .setColor("Green")
        await interaction.reply({ embeds: [embed] })
    }
}