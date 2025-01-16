const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('../../../config');
const { DateTime } = require('luxon');
const Manager = require('../../database/Manager');
const PrefixCommandManager = require('../PrefixCommand');
const EventManager = require('../Event');
const AntiCrashManager = require('../Anticrash');

class Velish extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildBans,
                GatewayIntentBits.GuildEmojisAndStickers,
                GatewayIntentBits.GuildInvites,
            ],
            partials: [
                Partials.Channel,
                Partials.Message,
                Partials.User,
                Partials.GuildMember,
                Partials.Reaction,
                Partials.ThreadMember,
                Partials.GuildScheduledEvent,
            ],
        });

        this.databaseManager = new Manager();
        this.prefixCommandManager = new PrefixCommandManager(this, config.prefix);
        this.eventManager = new EventManager(this);
        this.antiCrashManager = new AntiCrashManager(this);
        this.prefix = config.prefix;
    }

    async start() {
        try {
            console.log(`[${DateTime.now().toFormat('HH:mm')}]`.green + ' Connexion à la DB...'.yellow);
            await this.databaseManager.initialize();
            console.log(`[${DateTime.now().toFormat('HH:mm')}]`.green + ' Modèles synchro avec la DB'.green);
            await this.login(config.token);
        } catch (error) {
            console.error(`[${DateTime.now().toFormat('HH:mm')}]`.red + ` Erreur : ${error.message}`.red);
        }
    }
}

module.exports = Velish;