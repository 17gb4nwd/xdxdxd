const { DateTime } = require('luxon');
require('colors');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(
            `[${DateTime.now().toFormat('HH:mm')}]`.green +
            ` Log ${client.user.tag}`.green
        );

        client.user.setPresence({
            activities: [{ name: '', type: 4 }],
            status: 'online',
        });
    },
};