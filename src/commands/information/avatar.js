const {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
} = require("discord.js");

module.exports = class AvatarCommand {
    constructor() {
        this.name = "avatar";
        this.description = "Voir l'avatar d'un membre";
        this.usage = "avatar [membre]";
        this.aliases = ["pic", "pdp", "pp", "icon", "pfp"];
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

        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

        const avatarButton = new ButtonBuilder()
            .setLabel("Télécharger la pdp")
            .setStyle(ButtonStyle.Link)
            .setURL(avatarURL);

        const row = new ActionRowBuilder().addComponents(avatarButton);

        const embed = new EmbedBuilder()
            .setAuthor({ name: user.username, iconURL: avatarURL })
            .setColor(0x2f3136)
            .setDescription(`- Avatar de ${user.username} \`(${user.id})\``)
            .setImage(avatarURL)
            .setTimestamp();

        await message.reply({ embeds: [embed], components: [row] });
    }
};