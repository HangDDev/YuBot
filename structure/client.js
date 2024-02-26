const {
  Client,
  GatewayIntentBits,
  Collection,
  EmbedBuilder,
  GuildMember,
  Guild,
} = require("discord.js");

/**
 * @class
 * @description Class represents YuBot client.
 */
class YuBot extends Client {
  /**
   * @description - Options of the YuBot client.
   * @param {Object} [options] - Options of the client.
   * @param {Boolean} [options.database=true] - Turn on/off database.
   */
  constructor({ database = true }) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
      ],
    });

    this.database = database;
    this.config = require("../config/config.json");
    this.webhooks = require("../config/webhook.json");
    this.emoji = require("../config/emoji.json");
    this.commands = new Collection();
    this.commandsArray = [];
    this.handler = [];
  }

  /**
   * @description Change bit field to human readable text
   * @param {BitFieldResolvable} bitfield - The bitfield to convert.
   * @returns {string[]} - The array of permission names.
   * @throws {TypeError} - If the bitfield is not a vaild.
   * @example
   * ```js
   * const { PermissionFlagsBits } = require("discord.js")
   *
   * const readableBit = readbleBitField(PermissionFlagsBits.KickMembers) // return "KickMembers" as string
   * ```
   */
  readableBitField(bitfield) {
    const permissions = new PermissionsBitField(bitfield);
    return permissions.toArray();
  }

  /**
   * @description Check if the bot has the permission in the guild
   * @param {Guild} guild - The guild to check.
   * @param {PermissionResolvable} permission - The permission to check.
   * @returns {boolean} - True if the bot has the permission, false otherwise.
   * @throws {TypeError} - If the guild or the permission is not valid.
   * @example
   * ```js
   * const { PermissionFlagsBits } = require("discord.js")
   *
   * const checkPermission = checkBotPerm(interaction.guild.id, PermissionFlagsBits.KickMembers)
   * ```
   */
  checkBotPerm(guild, permission) {
    return guild.members.me.permissions.has(permission);
  }

  /**
   * @description Check if the user has the permission in the guild
   * @param {GuildMember} member - The member to check.
   * @param {PermissionResolvable} permission - The permission to check.
   * @returns {boolean} - True if the member has the permission, false otherwise.
   * @throws {TypeError} - If the member or the permission is not valid.
   * @example
   * ```js
   * const { PermissionFlagsBits } = require("discord.js")
   *
   * const checkPermission = checkMemberPerm(PermissionFlagsBits.KickMembers)
   * ```
   */
  checkMemberPerm(member, permission) {
    return member.permissions.has(permission);
  }

  /**
   * @description Generate a simple embed object.
   * @param {Object} [options] - The options for the embed.
   * @param {boolean} [options.author=false] - Whether to show the author of the embed.
   * @param {Interaction} [options.interaction=undefined] - The interaction that triggered the embed, if any.
   * @param {string} options.description - The description of the embed.
   * @param {ColorResolvable} [options.color="Blue"] - The color of the embed.
   * @param {boolean} [options.footer=false] - Whether to show the footer of the embed.
   * @returns {EmbedData} - The created embed.
   * @throws {Error} - If the description is not provided.
   * @example
   * ```js
   * const embed = YuBot.simpleEmbed({
   *  author: true,
   *  interaction: interaction,
   *  desciption: "Example simple embed",
   *  color: "Blue",
   *  footer: false,
   * })
   * ```
   */
  simpleEmbed({
    author = false,
    interaction = undefined,
    description,
    color = "Blue",
    footer = false,
  } = {}) {
    if (!description)
      throw new Error(`Description is required for the simple embed.`);

    const embed = new EmbedBuilder();
    if (author)
      embed.setAuthor({
        name: interaction?.user.username ?? this.user.username,
        iconURL:
          interaction?.user.displayAvatarURL() ?? this.user.displayAvatarURL(),
      });
    if (footer)
      embed.setFooter({
        text: this.user.username,
        iconURL: this.user.displayAvatarURL(),
      });

    embed.setDescription(`${description}`);
    embed.setColor(`${color}`);

    return embed;
  }

  /**
   * @description Creates an embed with the given options and fields.
   * @param {Object} [options] - The options for the embed.
   * @param {string} [options.authorName=this.user.username] - The name of the author of the embed.
   * @param {string} [options.authorIcon=this.user.displayAvatarURL()] - The icon URL of the author of the embed.
   * @param {string} [options.title] - The title of the embed.
   * @param {string} [options.description] - The description of the embed.
   * @param {ColorResolvable} [options.color="Blue"] - The color of the embed.
   * @param {string} [options.footerText] - The text of the footer of the embed.
   * @param {string} [options.footerIcon] - The icon URL of the footer of the embed.
   * @param {string} [options.thumbnail] - The URL of the thumbnail of the embed.
   * @param {string} [options.image] - The URL of the image of the embed.
   * @param {boolean} [options.timestamp=true] - Whether to show the timestamp of the embed.
   * @param {...EmbedField} fields - The fields to add to the embed.
   * @param {string} fields.name - The name of the field.
   * @param {string} fields.value - The value of the field.
   * @param {boolean} [fields.inline=false] - Whether to display the field inline.
   * @returns {EmbedData} - The created embed.
   * @throws {Error} - If the footer icon is provided without the footer text, or if the field name or value is missing, or if the number of fields exceeds 25.
   * @example
   * ```js
   * const embed = YuBot.embed({
   *  authorName: "YuBot",
   *  authorIcon: YuBot.user.displayAvatarURL(),
   *  title: "Embed Title",
   *  description: "Embed Description",
   *  color: "Blue",
   *  footerText: "Generated by YuBot",
   *  footerText: YuBot.user.displayAvatarURL(),
   *  thumbnail: YuBot.user.displayAvatarURL(),
   *  image: YuBot.user.displayAvatarURL(),
   *  timestamp: true,
   * }, { name: "Field Name", value: "Field Value", inline: true })
   * ```
   */
  embed(
    {
      authorName = this.user.username,
      authorIcon = this.user.displayAvatarURL(),
      title,
      description,
      color = "Blue",
      footerText,
      footerIcon,
      thumbnail,
      image,
      timestamp = true,
    } = {},
    ...fields
  ) {
    const embed = new EmbedBuilder();
    if (authorName && authorIcon)
      embed.setAuthor({ name: authorName, iconURL: authorIcon });
    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (footerIcon && !footerText)
      throw new Error(
        `Cannot add a footer with footer icon but without footer text!`
      );
    if (footerText && footerIcon)
      embed.setFooter({ text: footerText, iconURL: footerIcon });
    if (footerText) embed.setFooter({ text: footerText });
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (image) embed.setImage(image);
    if (timestamp) embed.setTimestamp();
    embed.setColor(color);

    for (let field of fields) {
      if (
        (field.name && !field.value) ||
        (field.name && field.value.length <= 0)
      )
        throw new Error(`Cannot add a field with name but without value!`);
      if (
        (!field.name && field.value) ||
        (field.name.length <= 0 && field.value)
      )
        throw new Error(`Cannot add a field with value but without name!`);
    }
    if (fields.length > 25)
      throw new Error(`Cannot add more than 25 fields in an embed!`);
    if (fields.length > 0) embed.addFields(fields);
    return embed;
  }

  botNoPermEmbed({ permission }) {
    const embed = new EmbedBuilder()
      .setTitle(`${interaction.client.emoji.warn} Missing Permission!`)
      .setDescription(`I don't have right perimission.`)
      .setColor("Red")
      .addFields({
        name: `${client.config.emoji.lock} | Required permission`,
        value: `${codeBlock(permission.join(", "))}`,
      })
      .setFooter({ text: `${client.user.username}` })
      .setTimestamp();
    return embed;
  }

  userNoPermEmbed({ permission }) {
    const embed = new EmbedBuilder()
      .setTitle(`${interaction.client.emoji.warn} Missing Permission!`)
      .setDescription(`You don't have right perimission.`)
      .setColor("Red")
      .addFields({
        name: `${client.config.emoji.lock} | Required permission`,
        value: `${codeBlock(permission.join(", "))}`,
      })
      .setFooter({ text: `${client.user.username}` })
      .setTimestamp();
    return embed;
  }
};

module.exports = { YuBot }