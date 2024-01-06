const { Schema, model } = require("mongoose")

const schema = new Schema({
    Guild: {
        type: String,
        required: true,
    },
    Channel: {
        type: String,
        required: true,
    }
});

module.exports = model("ChatBot", schema)