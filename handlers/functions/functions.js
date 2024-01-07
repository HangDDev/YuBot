const { PermissionsBitField } = require("discord.js")

module.exports = (client) => {
    client.readableBitField = (bitfield) => {
        const permissions = new PermissionsBitField(bitfield)
        return permissions.toArray()
    }

    client.checkBotPerm = (guild, permission) => {
        return guild.members.me.permissions.has(permission)
    }

    client.checkUserPerm = (member, permission) => {
        return member.permissions.has(permission)
    }
}