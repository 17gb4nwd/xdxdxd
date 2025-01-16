const {
    EmbedBuilder,
} = require("discord.js");
const fetch = require("node-fetch");
const moment = require('moment');

module.exports = class BannerCommand {
    constructor() {
        this.name = "userinfo";
        this.description = "Affiche les infos d'un membre";
        this.usage = "userinfo";
        this.aliases = ["ui"];
    }

    async execute(message){
        const target = message.mentions.users.first() || message.author;
        const member = await message.guild.members.fetch(target.id);

        const created = `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`;
        const join = `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`;
        const roles = member.roles.highest.name || 'Aucun rôle';
        const boost = member.premiumSince 
            ? `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>` 
            : 'Ne booste pas';

            let bannerURL = null;
        try {
            const user = await message.client.users.fetch(target.id, { force: true });
            if (user.banner) {
                bannerURL = user.bannerURL({ size: 1024, dynamic: true });
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de la bannière:", error);
        }

        const embed = new EmbedBuilder()
        .setDescription(`**ID :** ${target.id}\n**Date de création :** ${created}\n**Rejoint le :** ${join}\n**Rôle le plus haut :** ${roles}\n**Boost depuis :** ${boost}`)
        .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 512 }))
        .setImage(bannerURL)

        await message.channel.send({ embeds: [embed] });
    }
}