const { Events } = require("discord.js")
const RsnChat = require("rsnchat");
const config = require("../../config/config.json")
const rsnchat = new RsnChat(config.api.gpt);
const ChatBot = require("../../schema/chatbot.js")

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (!message.guild || message.author.bot) return
        const channel = await ChatBot.findOne({ Guild: message.guild.id, Channel: message.channel.id })
        if (!channel) return

        await message.channel.sendTyping()

        try {
            rsnchat.gpt(message).then(async (response) => {
              if (response.success) {
                  const embed = message.client.simpleEmbed({
                    author: true,
                    description: response.message,
                  })
              message.reply({ embeds: [embed] })
              } else {
                  await message.reply(`${message.client.emoji.warn} | I am sorry, I could not connect to my chat API. This might be due to a network issue or a temporary outage. Please try again later. You may contact my developer in [support server](${message.client.config.links.support}). Thank your for your patience and understanding.`);
              }
            });
          } catch (error) {
            console.error(error);
            await message.reply(
              `${message.client.emoji.warn} | I am sorry, something went wrong. This might due to errors in my code or an API error. Please try again later or contact my developer in [support server](${message.client.config.links.support}). Thank your for your patience and understanding.`
            );
          }
    }
}