const { ShardingManager, WebhookClient, EmbedBuilder } = require("discord.js");
const config = require("./config/config.json")
const webhook = require("./config/webhook.json")

const manager = new ShardingManager("./bot.js", {
  totalShards: 'auto',
  token: config.bot.token,
  respawn: true,
});


const webHooksArray = ['startLogs', 'shardLogs', 'consoleLogs', 'errorLogs'];

if (config.webhook.id && config.webhook.token) {
    for (const webhookName of webHooksArray) {
        webhook[webhookName].id = config.webhook.id;
        webhook[webhookName].token = config.webhook.token;
    }
}

const startLogs = new WebhookClient({
    id: webhook.startLogs.id,
    token: webhook.startLogs.token,
});

const shardLogs = new WebhookClient({
    id: webhook.shardLogs.id,
    token: webhook.shardLogs.token,
});

manager.on('shardCreate', shard => {
    let embed = new EmbedBuilder()
        .setTitle(`🆙・Launching shard`)
        .setDescription(`A shard has just been launched`)
        .setFields([
            {
                name: "🆔┆ID",
                value: `${shard.id + 1}/${manager.totalShards}`,
                inline: true
            },
            {
                name: `📃┆State`,
                value: `Starting up...`,
                inline: true
            }
        ])
        .setColor("Green")
    startLogs.send({
        username: 'Shard Create',
        embeds: [embed],
    });

    console.log(`Starting Shard #${shard.id + 1}...`)

    shard.on("death", (process) => {
        const embed = new EmbedBuilder()
            .setTitle(`🚨・Closing shard ${shard.id + 1}/${manager.totalShards} unexpectedly`)
            .setFields([
                {
                    name: "🆔┆ID",
                    value: `${shard.id + 1}/${manager.totalShards}`,
                },
            ])
            .setColor("Red")
        shardLogs.send({
            username: 'Shard Death',
            embeds: [embed]
        });

        if (process.exitCode === null) {
            const embed = new EmbedBuilder()
                .setTitle(`🚨・Shard ${shard.id + 1}/${manager.totalShards} exited with NULL error code!`)
                .setFields([
                    {
                        name: "PID",
                        value: `\`${process.pid}\``,
                    },
                    {
                        name: "Exit code",
                        value: `\`${process.exitCode}\``,
                    }
                ])
                .setColor("Red")
            shardLogs.send({
                username: 'Shard Exit',
                embeds: [embed]
            });
        }
    });

    shard.on("shardDisconnect", (event) => {
        const embed = new EmbedBuilder()
            .setTitle(`🚨・Shard ${shard.id + 1}/${manager.totalShards} disconnected`)
            .setDescription("Dumping socket close event...")
            .setColor("Red")
        shardLogs.send({
            username: 'Shard Disconnect',
            embeds: [embed],
        });
    });

    shard.on("shardReconnecting", () => {
        const embed = new EmbedBuilder()
            .setTitle(`🚨・Reconnecting shard ${shard.id + 1}/${manager.totalShards}`)
            .setColor("Blue")
        shardLogs.send({
            username: 'Shard Reconnect',
            embeds: [embed],
        });
    });
});

manager.spawn();
