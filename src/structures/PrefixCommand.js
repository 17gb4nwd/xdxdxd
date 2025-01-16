const fs = require("fs");
const path = require("path");
const { DateTime } = require("luxon");
require("colors");

class PrefixCommandManager {
    constructor(client, prefix) {
        this.client = client;
        this.prefix = prefix;
        this.commands = new Map();
        this.aliases = new Map();
        this.loadCommands();
        this.client.on("messageCreate", (message) => this.handleMessage(message));
    }

    loadCommands() {
        const commandsPath = path.join(__dirname, "..", "commands");
        this.loadCommandsFromDirectory(commandsPath);
    }

    loadCommandsFromDirectory(directory) {
        const files = fs.readdirSync(directory);
        for (const file of files) {
            const filePath = path.join(directory, file);
            if (fs.statSync(filePath).isDirectory()) {
                this.loadCommandsFromDirectory(filePath);
            } else if (file.endsWith(".js")) {
                try {
                    const CommandClass = require(filePath);
                    if (typeof CommandClass === "function") {
                        const command = new CommandClass();
                        if (command.name && typeof command.execute === "function") {
                            this.commands.set(command.name, command);
                            if (command.aliases && Array.isArray(command.aliases)) {
                                for (const alias of command.aliases) {
                                    this.aliases.set(alias, command.name);
                                }
                            }
                            console.log(
                                `[${DateTime.now().toFormat("HH:mm")}]`.green +
                                ` [PREFIX COMMAND] ${command.name} ✅`.yellow
                            );
                        } else {
                            console.error(
                                `[ERREUR] ${file} n'a pas une structure valide : name ou execute manquants ❌`
                                    .red
                            );
                        }
                    } else {
                        console.error(`[ERREUR] ${file} n'est pas une classe ❌`.red);
                    }
                } catch (error) {
                    console.error(`[ERREUR] ${file} ❌`, error.message.red);
                }
            }
        }
    }

    async handleMessage(message) {
        if (message.author.bot || !message.content.startsWith(this.prefix)) return;

        const args = message.content.slice(this.prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();
        const actualCommandName = this.aliases.get(commandName) || commandName;
        const command = this.commands.get(actualCommandName);

        if (!command) {
            console.error(`[ERREUR] ${commandName} n'existe pas`.red);
            return message.reply("Commande introuvable ❌");
        }

        try {
            await command.execute(message, args);
            console.log(
                `[${DateTime.now().toFormat("HH:mm")}]`.green +
                ` [MESSAGE] ${actualCommandName} 🔧✅`.blue
            );
        } catch (error) {
            console.error(`[ERREUR] ${actualCommandName} : ${error.message}`.red);
            await message.reply("Erreur de commande ❌");
        }
    }
}

module.exports = PrefixCommandManager;