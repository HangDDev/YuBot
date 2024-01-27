const { SlashCommandBuilder } = require("discord.js");
const GuildSettings = require("../../schema/guildSetting.js")
const ChatBot = require("../../schema/chatbot.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Configurations of the server.")
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("check")
        .setDescription("Check if the configurations are setted in this server or not.")
    )
    .addSubcommandGroup((group) =>
      group
        .setName("view")
        .setDescription("View detailed information of configurations in the server")
        .addSubcommand(subcommand =>
          subcommand
            .setName("chatbot")
            .setDescription("View detailed information of the chat bot configuration of the server")
        )
    ),
    async execute(interaction) {
        const group = interaction.options.getSubcommandGroup()
        if (!group) {
            const subcommand = interaction.options.getSubcommand()
        if (subcommand == "check") {
            const settings = await GuildSettings.findOne({ Guild: interaction.guild.id });
            if (!settings) {
                const embed = interaction.client.simpleEmbed({
                    author: true,
                    description: `${interaction.client.emoji.no} | None of the configurations is setted in this server!\n\n**_Generating config schema for this server..._**`
                });
                await interaction.reply({ embeds: [embed] });
                try {
                    await GuildSettings.create({ Guild: interaction.guild.id });
                    const success = interaction.client.simpleEmbed({
                      author: true,
                      description: `${interaction.client.emoji.yes} | Successfully generated configuration schema for this server.`
                    })
                    await interaction.followUp({ embeds: [success]})
                } catch(err) {
                    console.err(err)
                    const failed = interaction.client.simpleEmbed({
                        author: true,
                        description: `${interaction.client.emoji.no} | Error generating configuration schema for this server!\n\nYou may contact our developer in [support server](${interaction.client.config.links.support}) for further information.`
                    })
                    await interaction.followUp({ embeds: [failed]})
                }
            } else {
                let description = "";
                for (let value in settings) {
                    if (typeof settings[value] == "boolean" && !value.startsWith(`$`)) {
                        description += `\n${interaction.client.emoji.arrow} ${value}: ${settings[value] ? `${interaction.client.emoji.yes}` : `${interaction.client.emoji.no}`}`
                    }
                }
                const embed = interaction.client.embed({
                    authorName: interaction.client.user.username,
                    authorIcon: interaction.client.user.displayAvatarURL(),
                    title: `Configuration States`,
                    description: description
                })
                await interaction.reply({ embeds: [embed] })
            }
        }
        } else if (group == "view") {
            const subcommand = interaction.options.getSubcommand()
            if (subcommand == "chatbot") {
                const data = await ChatBot.findOne({ Guild: interaction.guild.id })
                if (!data) {
                    const embed = interaction.client.embed({
                        authorName: interaction.client.user.username,
                        authorIcon: interaction.client.user.displayAvatarURL(),
                        description: `${interaction.client.emoji.warn} Chat bot system is not configured in this server!`
                    })
                    return await interaction.reply({ embeds: [embed] })
                } else {
                    const embed = interaction.client.embed({
                        authorName: interaction.client.user.username,
                        authorIcon: interaction.client.user.displayAvatarURL(),
                        description: `Configurations of chat bot system in this server.`
                    },
                    { name: `${interaction.client.emoji.channel} Channel`, value: `<#${data.Channel}> (${data.Channel})`},
                    { name: `${interaction.client.emoji.wrench} Turned on`, value: `${data.Turn}`})

                    await interaction.reply({ embeds: [embed] })
                }
            }
        }
    }
};
