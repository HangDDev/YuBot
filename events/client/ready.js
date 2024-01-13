const { Events, ActivityType, EmbedBuilder, WebhookClient } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    const startLogs = new WebhookClient({
        id: client.webhooks.startLogs.id,
        token: client.webhooks.startLogs.token,
    });

    let embed = new EmbedBuilder()
      .setTitle(`🆙 | Finishing shard`)
      .setDescription(`A shard just finished`)
      .addFields(
        {
          name: "🆔 | ID",
          value: `${client.shard.ids[0] + 1}/${client.shard.count}`,
          inline: true,
        },
        { name: "📃 | State", value: `Ready`, inline: true }
      )
      .setColor("Green");
    startLogs.send({
      username: "Shard Created",
      embeds: [embed],
    });

    setInterval(async function () {
      const promises = [client.shard.fetchClientValues("guilds.cache.size")];
      return Promise.all(promises).then((results) => {
        const totalGuilds = results[0].reduce(
          (acc, guildCount) => acc + guildCount,
          0
        );
        console.log(`Shard #${client.shard.ids[0] + 1} is ready!`);
        console.log(`Started on ${totalGuilds} guilds.`);

        let statuttext = [
          `/help`,
          `${totalGuilds} servers`,
          `In version ${require(`${process.cwd()}/package.json`).version}`,
        ];

        const randomText =
          statuttext[Math.floor(Math.random() * statuttext.length)];
        client.user.setPresence({
          activities: [{ name: randomText, type: ActivityType.Playing }],
          status: "online",
        });
      });
    }, 50000);
  },
};
