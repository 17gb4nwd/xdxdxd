const { EmbedBuilder } = require("discord.js");

module.exports = class BoostersCommand {
    constructor() {
        this.name = "boosters";
        this.description = "Voir la liste des membres qui boost le serveur";
        this.usage = "boosters";
        this.aliases = ["booster", "boost", "boosts"];
    }

    async execute(message, client) {
        const guild = message.guild;
        const members = await guild.members.fetch();
        const boosters = members.filter((member) => member.premiumSince);

        if (boosters.size === 0) {
            const noBoosters = new EmbedBuilder()
                .setColor(0x2f3136)
                .setDescription("❌ Aucun membre boost le serveur");
            return message.reply({ embeds: [noBoosters] });
        }

        const boosterList = boosters
            .map((booster) => {
                if (booster.user && booster.user.username && booster.user.id) {
                    return `${booster.user.username} (${booster.user.id})`;
                } else {
                    return "Utilisateur ❓ (ID ❓)";
                }
            })
            .join("\n");

        const embed = new EmbedBuilder()
            .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
            .setThumbnail(guild.iconURL())
            .setColor(0x2f3136)
            .setDescription(
                "- Voici la liste des membres qui boostent le serveur\n" +
                `   - Total de boosteurs: \`${boosters.size}\`\n` +
                "```json\n" +
                boosterList +
                "\n```" +
                "\n-# - **Velish** - [En savoir plus](https://discord.gg/...)"
            )
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};