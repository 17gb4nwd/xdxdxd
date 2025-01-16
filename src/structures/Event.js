const fs = require('fs');
const path = require('path');
const { DateTime } = require('luxon');
require('colors');

class EventManager {
    constructor(client) {
        this.client = client;
        this.loadEvents();
    }

    loadEvents() {
        const eventsPath = path.join(__dirname, '..', 'events');
        this.loadEventsFromDirectory(eventsPath);
    }

    loadEventsFromDirectory(directory) {
        const files = fs.readdirSync(directory);
        for (const file of files) {
            const filePath = path.join(directory, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                this.loadEventsFromDirectory(filePath);
            } else if (file.endsWith('.js')) {
                try {
                    const event = require(filePath);

                    if (!event.name || typeof event.execute !== 'function') {
                        console.error(`[ERREUR] ${file} est mal structuré`.red);
                        continue;
                    }

                    if (event.once) {
                        this.client.once(event.name, (...args) => event.execute(...args, this.client));
                    } else {
                        this.client.on(event.name, (...args) => event.execute(...args, this.client));
                    }

                    console.log(
                        `[${DateTime.now().toFormat('HH:mm')}]`.green +
                        ` [EVENT] ${event.name} ✅`.yellow
                    );
                } catch (error) {
                    console.error(`[ERREUR] ${file} : ${error.message}`.red);
                }
            }
        }
    }
}

module.exports = EventManager;