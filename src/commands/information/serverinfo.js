const {
    EmbedBuilder,
} = require("discord.js");
const fetch = require("node-fetch");
const moment = require('moment');

module.exports = class BannerCommand {
    constructor() {
        this.name = "serverinfo";
        this.description = "Affiche les infos du serveur";
        this.usage = "serverinfo";
        this.aliases = ["si"];
    }

    async execute(message, args, cache) {
        const { guild } = message;

        let owner;
        try {
            owner = await guild.fetchOwner();
        } catch (error) {
            console.error('Erreur lors de la récupération du propriétaire du serveur:', error);
            owner = `<@${guild.ownerId}>`;
        }

        const channels = guild.channels.cache.size;
        const verif = guild.verificationLevel;
        const boost = guild.premiumSubscriptionCount || 'Aucun boost';
        const level = guild.premiumTier ? `Niveau ${guild.premiumTier}` : '0';
        const afk = guild.afkChannel ? guild.afkChannel.name : 'Aucun';
        const createdAt = moment(guild.createdAt).format('DD/MM/YYYY à HH:mm:ss');
        const member = guild.memberCount;
        const roles = guild.roles.cache.size;
        const emojis = guild.emojis.cache.size;
        const sticker = guild.stickers.cache.size

        const embed = new EmbedBuilder()
        .setDescription(`**Propriétaire :** ${owner ? `<@${owner.id}>` : 'Propriétaire inconnu'}\n **Salons :** ${channels}\n**Verifications :** ${verif}\n**Boosts :** ${boost}\n**Niveau(x) :** ${level}\n**Salon AFK :** ${afk}\n**Crée le :** ${createdAt}\n**Membres :** ${member}\n**Roles :** ${roles}\n**Emojis :** ${emojis}\n**Stickers :** ${sticker}`)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setImage(guild.bannerURL({ dynamic: true }))
        .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    }
}