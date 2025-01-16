class AntiCrashManager {
    /**
     * @param {Client}
     */
    constructor(client) {
        this.client = client;
        this.registerHandlers();
    }

    registerHandlers() {
        process.on('uncaughtException', (error) => {
            console.error(error.stack);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error(promise);
            if (reason.code === 10062) return;
        });

        process.on('warning', (warning) => {});
        this.client.on('error', (error) => {});
        process.on('processTicksAndRejections', (reason) => {});
        process.on('uncaughtExceptionMonitor', (error, origin) => {});
        process.on('exit', (code) => {});
    }
}

module.exports = AntiCrashManager;