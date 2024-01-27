const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { RsnChat } = require("rsnchat");
const config = require("../../config/config.json")
const rsnchat = new RsnChat(config.api.gpt);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("image")
    .setDescription("Generate an image with AI tool")
    .setDMPermission(true)
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Description of the image")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const description = interaction.options.getString("description");
    try {
      rsnchat.dalle(description).then(async (response) => {
        if (response.success) {
            const imageBuffer = Buffer.from(response.image, 'base64');
            const attachment = new AttachmentBuilder()
            .setName("image.png")
            .setFile(imageBuffer)

            const embed = interaction.client.embed({
                author: true,
                description: description,
                image: "attachment://image.png",
            })
            await interaction.editReply({ embeds: [embed], files: [attachment] })
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
