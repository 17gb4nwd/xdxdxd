const fetch = require("node-fetch");

module.exports = class BannerCommand {
    constructor() {
        this.name = "create";
        this.description = "Ajoute des emojis";
        this.usage = "create";
        this.aliases = ["addemoji"];
    }

    async execute(message, args) {
        if (!args.length) {
            return message.reply("\`❌\` Veuillez mentionner au moins un émoji valide.");
        }

        const addedEmojis = [];
        const failedEmojis = [];

        for (const arg of args) {
            const emojiMention = arg.match(/<(a?):\w+:(\d+)>/);

            if (emojiMention) {
                const isAnimated = emojiMention[1] === "a";
                const emojiId = emojiMention[2];
                const emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? "gif" : "png"}`;
                const emojiName = arg.split(":")[1];

                try {
                    const emoji = await message.guild.emojis.create({
                        attachment: emojiUrl,
                        name: emojiName,
                    });
                    addedEmojis.push(emoji);
                } catch (error) {
                    console.error("Erreur lors de l’ajout de l’emoji :", error);
                    failedEmojis.push(arg);
                }
            } else {
                failedEmojis.push(arg);
            }
        }

        let responseMessage = "";

        if (addedEmojis.length > 0) {
            responseMessage += `\`✅\` Emoji(s) ajouté(s) avec succès : ${addedEmojis.map(e => e.toString()).join(" ")}\n`;
        }
        if (failedEmojis.length > 0) {
            responseMessage += `\`❌\` Échecs : ${failedEmojis.join(", ")}`;
        }

        return message.channel.send(responseMessage.trim());
    }
};
