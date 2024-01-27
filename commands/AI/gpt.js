const { SlashCommandBuilder } = require("discord.js");
const { RsnChat } = require("rsnchat");
const config = require("../../config/config.json")
const rsnchat = new RsnChat(config.api.gpt);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gpt")
    .setDescription("Chat with AI")
    .setDMPermission(true)
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Your message to AI")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const message = interaction.options.getString("message");
    try {
      rsnchat.gpt(message).then(async (response) => {
        if (response.success) {
            const embed = interaction.client.simpleEmbed({
                author: true,
                description: response.message,
            })
            await interaction.editReply({ embeds: [embed] })
        } else {
            await interaction.editReply(`${interaction.client.emoji.warn} | I am sorry, I could not connect to my chat API. This might be due to a network issue or a temporary outage. Please try again later. You may contact our developer in [support server](${interaction.client.config.links.support}). Thank your for your patience and understanding.`);
        }
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply(
        `${interaction.client.emoji.warn} | I am sorry, something went wrong. This might due to errors in my code or an API error. Please try again later or contact our developer in [support server](${interaction.client.config.links.support}). Thank your for your patience and understanding.`
      );
    }
  },
};
