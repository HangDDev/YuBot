const { Events } = require("discord.js")
const axios = require("axios")
const ChatBot = require("../../schema/chatbot.js")

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (!message.guild || message.author.bot) return
        const channel = await ChatBot.findOne({ Guild: message.guild.id, Channel: message.channel.id })
        if (!channel) return

        await message.channel.sendTyping()
        const url = `https://api.artix.cloud/api/v1/AI/gpt3.5T?q=${encodeURIComponent(message)}`

        try {
            const request = await axios.get(url);

            if (request.status == 200) {
                if (request.data.chat.length > 2000) {
                    request.data.chat = `**__I am sorry, the message is too long to send in Discord as Discord has a limit of 2000 characters in one message. Here is the remaining message:__**\n ${request.data.chat.slice(0, 1600)}`
                }
                await message.reply(request.data.chat)
            } else {
                await message.reply(`I am sorry, I could not connect to my chat api. This might be due to a network issue or a temporary outage. Please try again later. Thank you for your patience and understanding.`)
            }
        } catch(err) {
            console.error(err)
            await message.reply(`I am sorry, something went wrong. This might due to errors in my code or an API error. Please try again later or contact my developer in [support server](${message.client.config.links.support}). Thank your for your patience and understanding.`)
        }
    }
}