const { Schema, model } = require("mongoose")

const schema = new Schema({
    Guild: {
        type: String,
        required: true
    },
    ChatBot: {
        type: Boolean,
        required: false,
        default: false,
    }
})

module.exports = model("GuildSetting", schema)