module.exports = class FindCommand {
    constructor() {
        this.name = 'find';
    }

    async execute(message, args) {
        const targetMember = message.mentions.members.first();
        if (!targetMember) {
            return message.reply('Mentionne un membre');
        }

        const voiceChannel = targetMember.voice?.channel;
        if (voiceChannel) {
            return message.reply(
                `<:990yyes:1320180376936906793> <@${targetMember.user.id}> est dans le vocal <#${voiceChannel.id}>`
            );
        } else {
            return message.reply(
                `<:no_sdys:1320180403750834249> <@${targetMember.user.id}> n'est pas en vocal`
            );
        }
    }
};