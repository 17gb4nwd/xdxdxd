const {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
} = require("discord.js");

module.exports = class ServerBannerCommand {
    constructor() {
        this.name = "serverbanner";
        this.description = "Voir la bannière du serveur";
        this.usage = "serverbanner";
        this.aliases = ["serverban"];
    }

    async execute(message) {
        const guild = message.guild;

        if (!guild.bannerURL()) {
            const embed = new EmbedBuilder()
                .setColor(0x2f3136)
                .setDescription("❌ Le serveur n'a pas de bannière");
            return message.reply({ embeds: [embed] });
        }

        const bannerURL = guild.bannerURL({ dynamic: true, size: 1024 });

        const bannerButton = new ButtonBuilder()
            .setLabel("Télécharger la bannière")
            .setStyle(ButtonStyle.Link)
            .setURL(bannerURL);

        const row = new ActionRowBuilder().addComponents(bannerButton);

        const embed = new EmbedBuilder()
            .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
            .setColor(0x2f3136)
            .setDescription(`- Voici la bannière du serveur **${guild.name}**`)
            .setImage(bannerURL)
            .setTimestamp();

        await message.reply({ embeds: [embed], components: [row] });
    }
};