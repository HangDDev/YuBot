const { Events, EmbedBuilder } = require("discord.js")

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isContextMenuCommand()) return

        const command = interaction.client.commands.get(interaction.commandName)

        if (command) {
            try {
                command.execute(interaction)
            } catch (error) {
                const embed = new EmbedBuilder()
                .setTitle("Error")
                .setDescription("Something went wrong while executing the command, please try again later!")
                .setColor("Red")
                await interaction.reply({ embeds: [embed] })
            }
        }
    }
}