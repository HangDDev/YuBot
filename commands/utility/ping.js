const { SlashCommandBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Ping Pong! 🏓")
    .setDMPermission(true),
    async execute(interaction) {
        await interaction.reply({ content: `Pong! 🏓`})
    }
}