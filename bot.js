const {
  WebhookClient,
  ShardEvents,
  EmbedBuilder,
  codeBlock,
} = require("discord.js");
const fs = require("node:fs");
const mongoose = require("mongoose");
const { YuBot } = require("./structure/client.js");
const client = new YuBot({ database: true });

(() => {
  console.log("Started loading handlers & functions...");
  console.log("Started connecting to the database...");
  fs.readdirSync("./handlers").forEach((dir) => {
    fs.readdirSync(`./handlers/${dir}`).forEach((file) => {
      client.handler.push(file);
      require(`./handlers/${dir}/${file}`)(client);
    });
  });
  console.log(
    `Successfully loaded ${client.handler.length} handlers & functions!`
  );
  if (client.database) {
    mongoose
      .connect(client.config.database.link, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("Successfully connected to the database.");
      });
  } else {
    console.log("Database turned off!");
  }
})();

const webHooksArray = ["startLogs", "shardLogs", "consoleLogs", "errorLogs"];
if (client.config.webhook.id && client.config.webhook.token) {
  for (const webhookName of webHooksArray) {
    client.webhooks[webhookName].id = client.config.webhook.id;
    client.webhooks[webhookName].token = client.config.webhook.token;
  }
}

const consoleLogs = new WebhookClient({
  id: client.webhooks.consoleLogs.id,
  token: client.webhooks.consoleLogs.token,
});

const warnLogs = new WebhookClient({
  id: client.webhooks.warnLogs.id,
  token: client.webhooks.warnLogs.token,
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
  if (error)
    if (error.length > 950)
      error = error.slice(0, 950) + "... view console for details";
  if (error.stack)
    if (error.stack.length > 950)
      error.stack = error.stack.slice(0, 950) + "... view console for details";
  if (!error.stack) return;
  const embed = new EmbedBuilder()
    .setTitle(`🚨・Unhandled promise rejection`)
    .addFields([
      {
        name: "Error",
        value: error ? codeBlock(error) : "No error",
      },
      {
        name: "Stack error",
        value: error.stack ? codeBlock(error.stack) : "No stack error",
      },
    ])
    .setColor("Red");
  consoleLogs
    .send({
      username: "Error Logs",
      embeds: [embed],
    })
    .catch(() => {
      console.log("Error sending unhandled promise rejection to webhook");
      console.log(error);
    });
});

process.on("warning", (warn) => {
  console.warn("Warning:", warn);
  const embed = new EmbedBuilder()
    .setTitle(`🚨・New warning found`)
    .addFields([
      {
        name: `Warn`,
        value: `\`\`\`${warn}\`\`\``,
      },
    ])
    .setColor("Red");
  warnLogs
    .send({
      username: "Warning Logs",
      embeds: [embed],
    })
    .catch(() => {
      console.log("Error sending warning to webhook");
      console.log(warn);
    });
});

client.on(ShardEvents.Error, (error) => {
  console.log(error);
  if (error)
    if (error.length > 950)
      error = error.slice(0, 950) + "... view console for details";
  if (error.stack)
    if (error.stack.length > 950)
      error.stack = error.stack.slice(0, 950) + "... view console for details";
  if (!error.stack) return;
  const embed = new EmbedBuilder()
    .setTitle(`🚨・A websocket connection encountered an error`)
    .addFields([
      {
        name: `Error`,
        value: `\`\`\`${error}\`\`\``,
      },
      {
        name: `Stack error`,
        value: `\`\`\`${error.stack}\`\`\``,
      },
    ])
    .setColor("Red");
  consoleLogs.send({
    username: "Shard Error",
    embeds: [embed],
  });
});

client.login(client.config.bot.token);
