const { EmbedBuilder } = require("discord.js");

module.exports = class AllAdminsCommand {
    constructor() {
        this.name = "alladmins";
        this.description = "Voir la liste des admins du serveur";
        this.usage = "alladmins";
    }

    async execute(message, client) {
        const guild = message.guild;
        const members = await guild.members.fetch();
        const admins = members.filter((member) =>
            member.permissions.has("Administrator")
        );

        if (admins.size === 0) {
            const noAdmin = new EmbedBuilder()
                .setColor(0x2f3136)
                .setDescription("❌ Aucun admin sur le serveur");
            return message.reply({ embeds: [noAdmin] });
        }

        const adminList = admins
            .map((admin) => {
                if (admin.user && admin.user.username && admin.user.id) {
                    return `${admin.user.username} (${admin.user.id})`;
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
                "- Voici la liste des admins du serveur\n   - Total d'admins: " +
                "`" +
                admins.size +
                "`" +
                "\n" +
                "```json\n" +
                adminList +
                "```" +
                "\n-# - **Velish** - [En savoir plus](https://discord.gg/...)"
            )
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};