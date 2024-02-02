const { PermissionsBitField } = require("discord.js");

module.exports = (client) => {
  /**
   * Change bit field to human readable text
   * @param {String} bitfield bitfield to change
   * @example
   * ```js
   * const { PermissionFlagsBits } = require("discord.js")
   *
   * const readableBit = readbleBitField(PermissionFlagsBits.KickMembers) // return "KickMembers" as string
   * ```
   * @returns {String}
   */
  readableBitField = (bitfield) => {
    const permissions = new PermissionsBitField(bitfield);
    return permissions.toArray();
  };

  /**
   * Check if the bot has the permission in the guild
   * @param {String} guild Guild id of the guild to check
   * @param {String} permission Permission to check
   * @example
   * ```js
   * const { PermissionFlagsBits } = require("discord.js")
   *
   * const checkPermission = checkBotPerm(PermissionFlagsBits.KickMembers) // return true/false
   * ```
   * @returns {Boolean}
   */
  checkBotPerm = (guild, permission) => {
    return guild.members.me.permissions.has(permission);
  };
  /**
   * Check if the user has the permission in the guild
   * @param {String} member User id of the member to check
   * @param {String} permission Permission to check
   * @example
   * ```js
   * const { PermissionFlagsBits } = require("discord.js")
   *
   * const checkPermission = checkMemberPerm(PermissionFlagsBits.KickMembers) // return true/false
   * ```
   * @returns {Boolean}
   */
  checkMemberPerm = (member, permission) => {
    return member.permissions.has(permission);
  };
};
