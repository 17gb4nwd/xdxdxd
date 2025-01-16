const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const fetch = require("node-fetch");

module.exports = class BannerCommand {
    constructor() {
        this.name = "embed";
        this.description = "Crée un embed";
        this.usage = "embed";
        this.aliases = ["eb"];
    }

    async execute(message, args) {
        const embed = new EmbedBuilder()
        .setDescription('Panel Embed');

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('options')
        .setPlaceholder('Fais un choix')
        .addOptions([
            { label: '✏️ Modifier le titre', value: 'titre' },
            { label: '💭 Modifier la description',value: 'description' },
            { label: '🎨 Modifier la couleur',value: 'couleur' },
            { label: '🌅 Modifier l\'image',value: 'image' },
            { label: '🗺️ Modifier le thumbnail',value: 'thumbnail' },
            { label: '🔻 Modifier le footer',value: 'footer' },
            { label: '✂️ Modifier l\'auteur',value: 'auteur' },
            { label: '✅ Envoyer', value: 'envoyer' },
            { label: '❌ Annuler', value: 'annuler' },
        ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const messageReply = await message.channel.send({ content: '**Panel de création d\'embed**', embeds: [embed], components: [row] });

    const collector = message.channel.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 600000 });

    collector.on('collect', async i => {
        if (i.user.id !== message.author.id) {
            return await i.reply({ content: 'Cette commande vous est destinée.', ephemeral: true });
        }

        const option = i.values[0];

        switch (option) {
            case 'titre':
                await i.deferUpdate();
                await i.followUp({ content: 'Quel titre souhaitez-vous pour cet embed ?', ephemeral: true });
                const titleCollector = message.channel.createMessageCollector({
                    filter: m => m.author.id === message.author.id,
                    max: 1,
                    time: 600000
                });

                titleCollector.on('collect', async m => {
                    const newTitle = m.content.trim();
                    embed.setTitle(newTitle);
                    await messageReply.edit({ embeds: [embed], components: [row] });
                    m.delete();
                });

                titleCollector.on('end', collected => {
                    if (collected.size === 0) {
                        i.followUp({ content: 'Temps écoulé. La modification du titre a été annulée.', ephemeral: true });
                    }
                });
                break;

            case 'description':
                await i.deferUpdate();
                await i.followUp({ content: 'Quelle description souhaitez-vous ajouter à cet embed ?', ephemeral: true });
                const descriptionCollector = message.channel.createMessageCollector({
                    filter: m => m.author.id === message.author.id,
                    max: 1,
                    time: 600000
                });

                descriptionCollector.on('collect', async m => {
                    const newDescription = m.content.trim();
                    embed.setDescription(newDescription);
                    await messageReply.edit({ embeds: [embed], components: [row] });
                    m.delete();
                });

                descriptionCollector.on('end', collected => {
                    if (collected.size === 0) {
                        i.followUp({ content: 'Temps écoulé. La modification de la description a été annulée.', ephemeral: true });
                    }
                });
                break;

            case 'image':
                await i.deferUpdate();
                await i.followUp({ content: 'Veuillez fournir un lien d\'image pour mettre à jour l\'image de l\'embed.', ephemeral: true });
                const imageCollector = message.channel.createMessageCollector({
                    filter: m => m.author.id === message.author.id,
                    max: 1,
                    time: 600000
                });

                imageCollector.on('collect', async m => {
                    const imageUrl = m.content.trim();
                    if (!imageUrl) return;

                    embed.setImage(imageUrl);
                    await messageReply.edit({ embeds: [embed], components: [row] });
                    m.delete();
                });

                imageCollector.on('end', collected => {
                    if (collected.size === 0) {
                        i.followUp({ content: 'Temps écoulé. La modification de l\'image a été annulée.', ephemeral: true });
                    }
                });
                break;

            case 'thumbnail':
                await i.deferUpdate();
                await i.followUp({ content: 'Veuillez fournir un lien pour mettre à jour le thumbnail de l\'embed.', ephemeral: true });
                const thumbnailCollector = message.channel.createMessageCollector({
                    filter: m => m.author.id === message.author.id,
                    max: 1,
                    time: 600000
                });

                thumbnailCollector.on('collect', async m => {
                    const thumbnailUrl = m.content.trim();
                    if (!thumbnailUrl) return;

                    embed.setThumbnail(thumbnailUrl);
                    await messageReply.edit({ embeds: [embed], components: [row] });
                    m.delete();
                });

                thumbnailCollector.on('end', collected => {
                    if (collected.size === 0) {
                        i.followUp({ content: 'Temps écoulé. La modification du thumbnail a été annulée.', ephemeral: true });
                    }
                });
                break;

            case 'footer':
                await i.deferUpdate();
                await i.followUp({ content: 'Quel texte souhaitez-vous pour le footer de cet embed ?', ephemeral: true });
                const footerCollector = message.channel.createMessageCollector({
                    filter: m => m.author.id === message.author.id,
                    max: 1,
                    time: 600000
                });

                footerCollector.on('collect', async m => {
                    const newFooter = m.content.trim();
                    embed.setFooter({ text: newFooter });
                    await messageReply.edit({ embeds: [embed], components: [row] });
                    m.delete();
                });

                footerCollector.on('end', collected => {
                    if (collected.size === 0) {
                        i.followUp({ content: 'Temps écoulé. La modification du footer a été annulée.', ephemeral: true });
                    }
                });
                break;

            case 'auteur':
                await i.deferUpdate();
                await i.followUp({ content: 'Quel est le nom de l\'auteur ?', ephemeral: true });
                const authorCollector = message.channel.createMessageCollector({
                    filter: m => m.author.id === message.author.id,
                    max: 1,
                    time: 600000
                });

                authorCollector.on('collect', async m => {
                    const authorName = m.content.trim();
                    embed.setAuthor({ name: authorName });
                    await messageReply.edit({ embeds: [embed], components: [row] });
                    m.delete();
                });

                authorCollector.on('end', collected => {
                    if (collected.size === 0) {
                        i.followUp({ content: 'Temps écoulé. La modification de l\'auteur a été annulée.', ephemeral: true });
                    }
                });
                break;

            case 'couleur':
                await i.deferUpdate();
                await i.followUp({ content: 'Quelle couleur souhaitez-vous pour cet embed ? (Format hexadécimal)', ephemeral: true });
                const colorCollector = message.channel.createMessageCollector({
                    filter: m => m.author.id === message.author.id,
                    max: 1,
                    time: 600000
                });

                colorCollector.on('collect', async m => {
                    const newColor = m.content.trim();
                    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(newColor)) {
                        await i.followUp('Couleur invalide. Assurez-vous d\'utiliser un format hexadécimal correct (#RRGGBB).');
                    } else {
                        embed.setColor(newColor);
                        await messageReply.edit({ embeds: [embed], components: [row] });
                        m.delete();
                    }
                });

                colorCollector.on('end', collected => {
                    if (collected.size === 0) {
                        i.followUp({ content: 'Temps écoulé. La modification de la couleur a été annulée.', ephemeral: true });
                    }
                });
                break;

            case 'envoyer':
                await i.deferUpdate();
                await i.followUp({ content: 'Mentionnez le salon où vous souhaitez envoyer cet embed.', ephemeral: true });
                const channelCollector = message.channel.createMessageCollector({
                    filter: m => m.author.id === message.author.id,
                    max: 1,
                    time: 600000
                });

                channelCollector.on('collect', async m => {
                    const channelId = m.content.trim().replace(/<#|>/g, '');
                    const channel = message.guild.channels.cache.get(channelId);
                    if (channel && channel.isTextBased()) {
                        await channel.send({ embeds: [embed] });
                        await i.editReply({ content: `Embed envoyé dans ${channel}`, components: [] });
                        m.delete();
                    } else {
                        await i.followUp('Salon invalide. Assurez-vous de mentionner un salon texte valide.');
                    }
                });

                channelCollector.on('end', collected => {
                    if (collected.size === 0) {
                        i.followUp({ content: 'Temps écoulé. L\'envoi de l\'embed a été annulé.', ephemeral: true });
                    }
                });
                break;

            case 'annuler':
                await i.deferUpdate();
                await i.editReply({ content: 'Modification annulée.', components: [] });
                break;

            default:
                break;
        }
    });

    collector.on('end', () => {
        messageReply.edit({ components: [] });
    });
    }}