const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gpt')
        .setDescription('Chat with AI')
        .setDMPermission(true)
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Your message to AI')
                .setRequired(true)
        ),
    async execute(interaction) {
        
        await interaction.deferReply()
        const message = interaction.options.getString('message');
        const url = `https://api.artix.cloud/api/v1/AI/gpt3.5T?q=${encodeURIComponent(`Your role is now a chat bot build in a discord bot named YuBot made by someone called someone.ykh and reply to this message from the user: ` + message)}`;

        try {
            const response = await axios.get(url);
            if (response.status == 200) {
                const chatData = response.data.chat; 
                
                const embed = {
                    color: 0x0099ff,
                    title: 'Chat with GPT-3',
                    description: chatData,
                };

                await interaction.editReply({ embeds: [embed] });
            } else {
                await interaction.editReply(`${interaction.client.emoji.warn} | An error occurred while fetching chat data.`);
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply(`${interaction.client.emoji.warn} | An error occurred while processing your request.`);
        }
    },
};