const Velish = require('./src/structures/client/Velish');
const config = require('./config');
const client = new Velish();
client.start(config.token);