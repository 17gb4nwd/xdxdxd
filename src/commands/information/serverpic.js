const {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
} = require("discord.js");

module.exports = class ServerIconCommand {
    constructor() {
        this.name = "serverpic";
        this.description = "Voir l'icône du serveur";
        this.usage = "serverpic";
        this.aliases = ["servericon", "serveravatar"];
    }

    async execute(message) {
        const guild = message.guild;

        if (!guild.iconURL()) {
            const embed = new EmbedBuilder()
                .setColor(0x2f3136)
                .setDescription("❌ Le serveur n'a pas d'icône");
            return message.reply({ embeds: [embed] });
        }

        const iconURL = guild.iconURL({ dynamic: true, size: 1024 });

        const iconButton = new ButtonBuilder()
            .setLabel("Télécharger l'icône")
            .setStyle(ButtonStyle.Link)
            .setURL(iconURL);

        const row = new ActionRowBuilder().addComponents(iconButton);

        const embed = new EmbedBuilder()
            .setAuthor({ name: guild.name, iconURL: iconURL })
            .setColor(0x2f3136)
            .setDescription(`- Voici l'icône du serveur **${guild.name}**`)
            .setImage(iconURL)
            .setTimestamp();

        await message.reply({ embeds: [embed], components: [row] });
    }
};