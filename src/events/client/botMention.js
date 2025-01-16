const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    execute(message) {
        if (message.author.bot) return;
        if (message.mentions.has(message.client.user.id) && !message.mentions.everyone) {

            // pAs fini
            message.reply("Mon préfixe sur ce serveur est: `?`, pour voir la liste de mes commandes: `?help`");
        }
    },
};