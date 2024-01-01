const fs = require("node:fs")

eventHandler = async(client) => {
    const folders = fs.readdirSync("./events/")
    for (const folder of folders) {
        const files = fs.readdirSync(`./events/${folder}`).filter(f => f.endsWith(".js"))
        for (const file of files) {
            const event = require(`../../events/${folder}/${file}`)
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client))
            }
        }
    }
}

module.exports = eventHandler