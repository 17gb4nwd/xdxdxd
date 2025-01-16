const {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
} = require("discord.js");
const fetch = require("node-fetch");

module.exports = class BannerCommand {
    constructor() {
        this.name = "banner";
        this.description = "Voir la bannière d'un membre";
        this.usage = "banner [membre]";
        this.aliases = ["banniere"];
    }

    async execute(message, args) {
        const userId = args[0]?.replace(/[<@!>]/g, "") || message.author.id;
        let user;

        try {
            user = await message.client.users.fetch(userId);
        } catch (error) {
            const embed = new EmbedBuilder()
                .setColor(0x2f3136)
                .setDescription(
                    "❌ Je n'ai pas pu trouver ce membre, mentionne le ou utilise son ID"
                );
            return message.reply({ embeds: [embed] });
        }

        let bannerURL = null;
        try {
            const response = await fetch(
                `https://discord.com/api/v10/users/${user.id}`,
                {
                    headers: {
                        Authorization: `Bot ${message.client.token}`,
                    },
                }
            );
            if (response.ok) {
                const data = await response.json();
                if (data.banner) {
                    const extension = data.banner.startsWith("a_") ? "gif" : "png";
                    bannerURL = `https://cdn.discordapp.com/banners/${user.id}/${data.banner}.${extension}?size=1024`;
                }
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de la bannière:", error);
        }

        if (!bannerURL) {
            const embed = new EmbedBuilder()
                .setColor(0x2f3136)
                .setDescription("❌ Ce membre n'a aucune bannière");
            return message.reply({ embeds: [embed] });
        }

        const bannerButton = new ButtonBuilder()
            .setLabel("Télécharger la bannière")
            .setStyle(ButtonStyle.Link)
            .setURL(bannerURL);

        const row = new ActionRowBuilder().addComponents(bannerButton);

        const embed = new EmbedBuilder()
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true }),
            })
            .setColor(0x2f3136)
            .setDescription(`- Bannière de ${user.username} \`(${user.id})\``)
            .setImage(bannerURL)
            .setTimestamp();

        await message.reply({ embeds: [embed], components: [row] });
    }
};