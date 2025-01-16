const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fetch = require("node-fetch");
const { GiveawaySetting } = require('../../database/models/Perms/GiveawaySetting')

module.exports = class BannerCommand {
    constructor() {
        this.name = "giveaways";
        this.description = "Lance un giveaway";
        this.usage = "giveaways";
        this.aliases = ["gw"];
    }

    async execute(message, args) {
        if (!message.guild) return;
        
        const guildId = message.guild.id;
        const dbKey = `gwconfig_${guildId}`;
        
        async function fetchGiveawaySettings(guildId) {
            const settings = await GiveawaySetting.findOne({ where: { guildId } });
            return settings || {
                prize: 'Nitro',
                duration: 600000,
                emoji: '🎉',
                channelId: null,
                winners: 1,
                prohibitedRoles: [],
                requiredRoles: [],
                requireVoice: false,
                predefinedWinnerId: null,
            };
        }

        async function update() {
            const settings = await fetchGiveawaySettings();

            const rolesRequis = settings.rolerequis.map(roleId => message.guild.roles.cache.get(roleId));
            const rolesInterdit = settings.roleinterdit.map(roleId => message.guild.roles.cache.get(roleId));
            const salon = message.guild.channels.cache.get(settings.salon) || "Aucun";
            const winner = settings.winnerId ? `<@${settings.winnerId}>` : "Aucun";

            const embed = new EmbedBuilder()
                .setTitle('Paramètres du giveaway')
                .addFields(
                    { name: "Gain", value: `\`${settings.prix}\``, inline: true },
                    { name: "Durée", value: `\`${formatDuration(settings.dure)}\``, inline: true },
                    { name: "Salon", value: `\`${salon?.name || "Aucun"}\``, inline: true },
                    { name: "Rôle interdit", value: `\`${rolesInterdit.map(role => role?.name).join(', ') || "Aucun"}\``, inline: true },
                    { name: "Rôle obligatoire", value: `\`${rolesRequis.map(role => role?.name).join(', ') || "Aucun"}\``, inline: true },
                    { name: "Présence en vocal", value: `\`${settings.vocal ? "✅" : "❌"}\``, inline: true },
                    { name: "Emoji", value: `${settings.emoji}`, inline: true },
                    { name: "Gagnant prédéfini", value: `${winner}`, inline: true } // Afficher le gagnant prédéfini
                );

            const select = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select')
                        .addOptions(
                            { label: 'Modifier le gain', emoji: "🎁", value: "gain" },
                            { label: 'Modifier la durée', emoji: "⏱", value: "duree" },
                            { label: 'Modifier le salon', emoji: "🏷", value: "salon" },
                            { label: 'Modifier l\'emoji', emoji: "🎉", value: "emoji" },
                            { label: 'Modifier le rôle obligatoire', emoji: "⛓", value: "obligatoire" },
                            { label: 'Modifier le rôle interdit', emoji: "🚫", value: "interdit" },
                            { label: 'Modifier l\'obligation d\'être en vocal', emoji: "🔊", value: "vocal" },
                            { label: 'Définir le gagnant', emoji: "🏆", value: "set_winner" } // Nouvelle option pour définir le gagnant
                        )
                );

            const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('start')
                        .setStyle(ButtonStyle.Secondary)
                        .setLabel('Lancer le giveaway')
                        .setEmoji('🚀')
                );

            return { embed, select, button };
        }

        const settings = await fetchGiveawaySettings();
        const { embed, select, button } = await update();
        const msg = await message.channel.send({ embeds: [embed], components: [select, button] });

        const collector = msg.createMessageComponentCollector();

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({
                    content: 'Vous ne pouvez pas interagir avec ce giveaway.',
                    ephemeral: true
                });
            }

            try {
                let settings = await fetchGiveawaySettings();

                switch (interaction.customId) {
                    case 'start':
                        await interaction.deferReply({ ephemeral: true });

                        const channel = message.guild.channels.cache.get(settings.salon);
                        if (!channel) {
                            return interaction.editReply({ content: "Le salon des giveaways n'est pas configuré" });
                        }


                        const code = generateCode();

                        const giveawayEmbed = new EmbedBuilder()
                            .setColor(color)
                            .setFooter({ text: `Giveaway code: ${code}` })
                            .setTitle(`Giveaway: ${settings.prix}`)
                            .setDescription('Réagissez avec l\'emoji pour participer !\nNombre de gagnants : 1')
                            .addFields({ name: "Fin du giveaway", value: `<t:${Math.floor((Date.now() + settings.dure) / 1000)}:R>` });

                        // Gestion de l'emoji (custom ou standard)
                        const emoji = parseEmoji(settings.emoji);
                        if (!emoji) {
                            return interaction.editReply({ content: "Emoji invalide. Veuillez définir un emoji valide." });
                        }

                        const giveawayMessage = await channel.send({ embeds: [giveawayEmbed] });
                        try {
                            if (emoji.id) {
                                // Emoji personnalisé
                                await giveawayMessage.react(emoji.id);
                            } else {
                                // Emoji standard Unicode
                                await giveawayMessage.react(emoji.name);
                            }
                        } catch (err) {
                            console.error("Erreur lors de l'ajout de la réaction :", err);
                            return interaction.editReply({ content: "Impossible d'ajouter l'emoji en réaction. Assurez-vous que le bot a accès à cet emoji." });
                        }

                        const giveawayData = {
                            participants: [],
                            messageId: giveawayMessage.id,
                            author: interaction.user.id,
                            create: Date.now(),
                            end: false,
                            endTime: Date.now() + settings.dure,
                            endAuthor: null,
                            code: code,
                            prix: settings.prix,
                            wins: settings.wins,
                            dure: settings.dure,
                            emoji: settings.emoji,
                            salon: settings.salon,
                            roleinterdit: settings.roleinterdit,
                            rolerequis: settings.rolerequis,
                            vocal: settings.vocal,
                            winnerId: settings.winnerId // Stocker l'ID du gagnant prédéfini
                        };

                        await db.push(`giveaways_${guildId}`, giveawayData);
                        await db.set(`giveaway_${guildId}_${code}`, giveawayData);

                        interaction.editReply({
                            content: 'Giveaway lancé',
                            components: [
                                new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setStyle(ButtonStyle.Link)
                                        .setURL(`https://discord.com/channels/${guildId}/${channel.id}/${giveawayMessage.id}`)
                                        .setLabel('Lien du giveaway')
                                )
                            ]
                        });

                        // Set up reaction collector
                        const reactionCollector = giveawayMessage.createReactionCollector({
                            time: settings.dure,
                            dispose: true 
                        });

                        reactionCollector.on('end', async () => {
                            const giveaway = await db.get(`giveaway_${guildId}_${code}`);
                            if (giveaway && !giveaway.end) {
                                const reactionKey = emoji.id ? emoji.id : emoji.name;
                                const reaction = giveawayMessage.reactions.cache.get(reactionKey);

                                if (reaction) {
                                    const users = await reaction.users.fetch();
                                    users.forEach(async (user) => {
                                        if (!user.bot && !giveaway.participants.includes(user.id)) {
                                            giveaway.participants.push(user.id);
                                            await db.set(`giveaway_${guildId}_${code}`, giveaway);
                                        }
                                    });
                                }

                                let winners = [];
                                if (settings.winnerId) {
                                    winners.push(settings.winnerId); // Ajouter le gagnant prédéfini
                                }

                                // Ajouter des gagnants supplémentaires s'il y a de la place et s'il reste des participants
                                const remainingWinnersCount = settings.wins - winners.length;
                                if (remainingWinnersCount > 0 && giveaway.participants.length > 0) {
                                    const additionalWinners = pickWinners(giveaway.participants.filter(p => p !== settings.winnerId), remainingWinnersCount);
                                    winners = winners.concat(additionalWinners);
                                }

                                const winnerMentions = winners.map(winnerId => `<@${winnerId}>`).join(', ');

                                await channel.send(`🎉 Félicitations à ${winnerMentions} qui a gagné **${giveaway.prix}** !`);

                                giveaway.end = true;
                                giveaway.endAuthor = message.author.id;
                                await db.set(`giveaway_${guildId}_${code}`, giveaway);
                            }
                        });
                        break;

                    case 'select':
                        await interaction.deferUpdate();

                        if (interaction.values[0] === "vocal") {
                            settings.vocal = !settings.vocal;
                            await db.set(dbKey, settings);
                            msg.edit({ embeds: [(await update()).embed] });
                        } else if (interaction.values[0] === "gain") {
                            const newGain = await promptUserInput(message, "Veuillez entrer le nouveau gain :");
                            if (newGain) {
                                settings.prix = newGain;
                                await db.set(dbKey, settings);
                                msg.edit({ embeds: [(await update()).embed] });
                            } else {
                                interaction.reply({ content: "Aucun gain entré, changement annulé.", ephemeral: true });
                            }
                        } else if (interaction.values[0] === "duree") {
                            const newDuration = await promptUserInput(message, "Veuillez entrer la nouvelle durée, par exemple `10h, 3j, 30m` :");
                            const durationMs = parseDuration(newDuration);
                            if (durationMs) {
                                settings.dure = durationMs;
                                await db.set(dbKey, settings);
                                msg.edit({ embeds: [(await update()).embed] });
                            } else {
                                interaction.reply({ content: "Durée invalide, changement annulé.", ephemeral: true });
                            }
                        } else if (interaction.values[0] === "salon") {
                            const newChannelId = await promptUserInput(message, "Veuillez mentionner le nouveau salon pour le giveaway :");
                            const newChannel = message.guild.channels.cache.get(newChannelId.replace(/[<#>|]/g, ''));
                            if (newChannel) {
                                settings.salon = newChannel.id;
                                await db.set(dbKey, settings);
                                msg.edit({ embeds: [(await update()).embed] });
                            } else {
                                interaction.reply({ content: "Salon invalide, changement annulé.", ephemeral: true });
                            }
                        } else if (interaction.values[0] === "emoji") {
                            const newEmoji = await promptUserInput(message, "Veuillez entrer le nouvel emoji pour le giveaway :");
                            const parsedEmoji = parseEmoji(newEmoji);
                            if (parsedEmoji) {
                                settings.emoji = newEmoji;
                                await db.set(dbKey, settings);
                                msg.edit({ embeds: [(await update()).embed] });
                            } else {
                                interaction.reply({ content: "Emoji invalide, changement annulé.", ephemeral: true });
                            }
                        } else if (interaction.values[0] === "interdit") {
                            const newRoleId = await promptUserInput(message, "Veuillez mentionner le nouveau rôle interdit pour le giveaway :");
                            if (newRoleId) {
                                toggleRoleInSettings(settings, newRoleId, 'roleinterdit');
                                await db.set(dbKey, settings);
                                msg.edit({ embeds: [(await update()).embed] });
                            } else {
                                interaction.reply({ content: "Rôle invalide, changement annulé.", ephemeral: true });
                            }
                        } else if (interaction.values[0] === "obligatoire") {
                            const newRoleId = await promptUserInput(message, "Veuillez mentionner le nouveau rôle obligatoire pour le giveaway :");
                            if (newRoleId) {
                                toggleRoleInSettings(settings, newRoleId, 'rolerequis');
                                await db.set(dbKey, settings);
                                msg.edit({ embeds: [(await update()).embed] });
                            } else {
                                interaction.reply({ content: "Rôle invalide, changement annulé.", ephemeral: true });
                            }
                        } else if (interaction.values[0] === "set_winner") {
                            const winnerId = await promptUserInput(message, "Veuillez entrer l'ID du gagnant :");
                            if (winnerId) {
                                settings.winnerId = winnerId;
                                await db.set(dbKey, settings);
                                msg.edit({ embeds: [(await update()).embed] });
                            } else {
                                interaction.reply({ content: "ID de gagnant invalide, changement annulé.", ephemeral: true });
                            }
                        }
                        break;

                    default:
                        break;
                }
            } catch (error) {
                console.error("Error handling interaction:", error);
                interaction.reply({ content: "Une erreur est survenue lors du traitement de l'interaction.", ephemeral: true });
            }
        });

        function toggleRoleInSettings(settings, roleId, key) {
            const role = message.guild.roles.cache.get(roleId.replace(/[<@&>]/g, ''));
            if (role) {
                const index = settings[key].indexOf(role.id);
                if (index > -1) {
                    settings[key].splice(index, 1);
                } else {
                    settings[key].push(role.id);
                }
            }
        }

        async function promptUserInput(message, question) {
            const filter = response => response.author.id === message.author.id;
            const promptMessage = await message.channel.send(question);
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000 });
            await promptMessage.delete();
            if (collected.size === 0) return null;
            const response = collected.first();
            await response.delete();
            return response.content;
        }

        function parseDuration(duration) {
            const regex = /(\d+)([hmsj])/g;
            let matches, totalMs = 0;
            while ((matches = regex.exec(duration)) !== null) {
                const [_, value, unit] = matches;
                if (unit === 'h') totalMs += parseInt(value) * 3600000;
                if (unit === 'm') totalMs += parseInt(value) * 60000;
                if (unit === 's') totalMs += parseInt(value) * 1000;
                if (unit === 'j') totalMs += parseInt(value) * 86400000;
            }
            return totalMs || null;
        }

        function formatDuration(ms) {
            const totalSeconds = Math.floor(ms / 1000);
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            return `${days}j ${hours}h ${minutes}m ${seconds}s`;
        }

        function generateCode() {
            return Math.random().toString(36).substring(2, 15);
        }

        function pickWinners(participants, numberOfWinners) {
            const shuffled = participants.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, Math.min(numberOfWinners, participants.length));
        }

        function parseEmoji(emoji) {
            const customEmojiRegex = /<a?:\w+:(\d+)>/;
            const match = emoji.match(customEmojiRegex);
            if (match) {
                return { id: match[1], name: emoji.split(':')[1] };
            } else if (/^[\u{1F600}-\u{1F6FF}]/u.test(emoji) || /^\p{Extended_Pictographic}$/u.test(emoji)) {
                // Emoji standard Unicode
                return { id: null, name: emoji };
            } else {
                return null;
            }
        }

        function compareEmojis(reactionEmoji, settingsEmoji) {
            if (reactionEmoji.id) {
                // Emoji personnalisé
                return `<:${reactionEmoji.identifier}>` === settingsEmoji || `<a:${reactionEmoji.identifier}>` === settingsEmoji;
            } else {
                // Emoji standard
                return reactionEmoji.name === settingsEmoji;
            }
        }
    }
};