const { SlashCommandBuilder, version } = require("discord.js");
const moment = require("moment");
require("moment-duration-format");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Get information of the bot!"),
  async execute(interaction) {
    const promises = [
        interaction.client.shard.broadcastEval(client => client.guilds.cache.size),
        interaction.client.shard.broadcastEval(client => client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
        interaction.client.shard.broadcastEval(client => client.channels.cache.size),
        interaction.client.shard.broadcastEval(client => client.voice.adapters.size)
    ];

    return Promise.all(promises)
        .then(async results => {
            const totalGuilds = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
            const totalMembers = results[1].reduce((acc, memberCount) => acc + memberCount, 0);
            const totalChannels = results[2].reduce((acc, channelCount) => acc + channelCount, 0);
            const duration = moment.duration(interaction.client.uptime).format("D [days], H [hrs], m [mins], s [secs]");

            const embed = interaction.client.embed({
              authorName: interaction.client.user.username,
              authorIcon: interaction.client.user.displayAvatarURL(),
              thumbnail: interaction.client.user.displayAvatarURL(),
              color: "Blue",
              description: `${interaction.client.user.username} is a multipurpose bot made for improving servers.`
            }, { name: `🤖 | Bot Name`, value: `${interaction.client.user.username}`, inline: true },
              { name: `🆔 | Bot ID`, value: `${interaction.client.user.id}`, inline: true },
              { name: `💻 | Shards`, value: `${interaction.client.shard.count} Shard(s)`, inline: true },
              { name: `⚒️ | Bot Developer`, value: `someone.ykh`, inline: true },
              { name: `⌨️ | Commands`, value: `${interaction.client.commands.size} commands`, inline: true },
              { name: `🌐 | Servers`, value: `${totalGuilds} servers`, inline: true },
              { name: `👥 | Members`, value: `${totalMembers} members`, inline: true },
              { name: `📺 | Channels`, value: `${totalChannels}`, inline: true },
              { name: `🗓️ | Bot Created`, value: `<t:${Math.round(interaction.client.user.createdTimestamp / 1000)}>`, inline: true },
              { name: `🔼 | Uptime`, value: `${duration}`, inline: true },
              { name: `⏱️ | API Speed`, value: `${interaction.client.ws.ping} ms`, inline: true },
              { name: `💾 | Bot memory`, value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
              { name: `🤖 | Bot Version`, value: `${require(`${process.cwd()}/package.json`).version}`, inline: true },
              { name: `🔗 | Node.js Version`, value: `${process.version}`, inline: true },
              { name: `📂 | Discord.js Version`, value: `${version}`, inline: true },
              { name: `🔗 | Links`, value: `Invite ${interaction.client.user.username}: [[Here](${interaction.client.config.links.invite})] Support Server: [[Here](${interaction.client.config.links.support})]` }
            )

            await interaction.reply({ embeds: [embed] });
        })
  },
};
