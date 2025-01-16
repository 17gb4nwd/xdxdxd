const {
    EmbedBuilder,
} = require("discord.js");
const fetch = require("node-fetch");

module.exports = class BannerCommand {
    constructor() {
        this.name = "vc";
        this.description = "Affiche les stats vocal";
        this.usage = "vc";
        this.aliases = ["stats"];
    }

    async execute(message) {
        if (!message.guild) return;

        const { guild } = message;
        const members = guild.memberCount;
        const online = guild.members.cache.filter(member => member.presence && ['online', 'idle', 'dnd'].includes(member.presence.status)).size;
        const boost = guild.premiumSubscriptionCount || 0;
        const voc = guild.members.cache.filter(member => member.voice.channel).size;
        const stream = guild.members.cache.filter(member => member.voice.streaming).size;

        const embed = new EmbedBuilder()
        .setAuthor({ name: `${guild.name} - Statistiques`, iconURL: 'https://i.ibb.co/q5wDtDZ/915457888238075985.gif' })
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setDescription(`*Membres totaux:* **${members}**\n*Membres en ligne:* **${online}**\n*Boosts:* **${boost}**\n*Membres en vocal:* **${voc}**\n*Membres en stream:* **${stream}**`)
        .setFooter({ text: `${guild}`, iconURL: guild.iconURL({ dynamic: true }) })
        .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
}