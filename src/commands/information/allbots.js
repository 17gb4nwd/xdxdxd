const { EmbedBuilder } = require("discord.js");

module.exports = class AllBotsCommand {
    constructor() {
        this.name = "allbots";
        this.description = "Voir la liste des bots du serveur";
        this.usage = "allbots";
    }

    async execute(message, client) {
        const guild = message.guild;
        const members = await guild.members.fetch();
        const bots = members.filter((member) => member.user.bot);

        if (bots.size === 0) {
            const noBots = new EmbedBuilder()
                .setColor(0x2f3136)
                .setDescription("❌ Aucun bot sur le serveur");
            return message.reply({ embeds: [noBots] });
        }

        const botsWithAdmin = bots.filter((bot) =>
            bot.permissions.has("Administrator")
        );
        const botsWithoutAdmin = bots.filter(
            (bot) => !bot.permissions.has("Administrator")
        );

        const formatBotList = (botList) => {
            return botList
                .map((bot) => {
                    if (bot.user && bot.user.username && bot.user.id) {
                        return `${bot.user.username} (${bot.user.id})`;
                    } else {
                        return "Bot ❓ (ID ❓)";
                    }
                })
                .join("\n");
        };

        const adminBotsList = formatBotList(botsWithAdmin);
        const nonAdminBotsList = formatBotList(botsWithoutAdmin);

        const embed = new EmbedBuilder()
            .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
            .setThumbnail(guild.iconURL())
            .setColor(0x2f3136)
            .setDescription(
                "- Voici la liste des bots du serveur\n" +
                `   - Total des bots: \`${bots.size}\`\n` +
                `   - Bots avec la perm admin: \`${botsWithAdmin.size}\`\n` +
                `   - Bots sans la perm admin: \`${botsWithoutAdmin.size}\`\n` +
                "\n- **Bots avec la perm admin:**\n```json\n" +
                (adminBotsList || "Aucun bot avec perm admin") +
                "\n```" +
                "\n- **Bots sans la perm admin:**\n```json\n" +
                (nonAdminBotsList || "Aucun bot sans perm admin") +
                "\n```\n-# - **Velish** - [En savoir plus](https://discord.gg/...)"
            )
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};