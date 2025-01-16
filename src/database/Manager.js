const { Sequelize, DataTypes } = require("sequelize");
const fs = require("fs");
const path = require("path");
const config = require("../../config");
require("colors");

class Manager {
    constructor() {
        this.models = new Map();
        this.modelsPath = path.resolve(__dirname, "models");

        this.sequelize = new Sequelize(
            config.database.name,
            config.database.user,
            config.database.password,
            {
                ...config.database.options,
                logging: (msg) => console.log(`[SEQUELIZE] ${msg}`.blue),
            }
        );
    }

    async initialize() {
        try {
            await this.sequelize.authenticate();
            this.loadModels();
            console.log(`[MANAGER] Synchro des modèles avec la db...`.yellow);
            await this.sequelize.sync({ alter: true });
        } catch (error) {
            console.error(
                "[MANAGER] Erreur lors de la connexion à la base de données :".red,
                error.message
            );
            process.exit(1);
        }
    }

    loadModels() {
        if (!fs.existsSync(this.modelsPath)) {
            console.error(
                `[MANAGER] Aucun répertoire de modèles trouvé : ${this.modelsPath}`.red
            );
            return;
        }

        const files = fs.readdirSync(this.modelsPath);

        files.forEach((file) => {
            const filePath = path.join(this.modelsPath, file);

            if (fs.statSync(filePath).isDirectory()) {
                const subFiles = fs.readdirSync(filePath);
                subFiles.forEach((subFile) => {
                    const subFilePath = path.join(filePath, subFile);
                    if (subFilePath.endsWith(".js")) {
                        this.loadModel(subFilePath);
                    }
                });
            } else if (file.endsWith(".js")) {
                this.loadModel(filePath);
            }
        });

        if (this.models.size === 0) {
            console.error("[MANAGER] Aucun modèle chargé.".red);
        } else {
            console.log(
                "[MANAGER] Modèles chargés :",
                Array.from(this.models.keys()).join(", ").yellow
            );
        }
    }

    loadModel(filePath) {
        try {
            const defineModel = require(filePath);
            const modelName = path.basename(filePath, ".js");

            const model = defineModel(this.sequelize, DataTypes);
            this.models.set(modelName, model);
        } catch (error) {
            console.error(
                `[MANAGER] Erreur lors du chargement du modèle ${filePath} : ${error.message}`
                    .red
            );
        }
    }

    getModel(modelName) {
        if (!this.models.has(modelName)) {
            throw new Error(`[MANAGER] Modèle introuvable : ${modelName}`);
        }
        return this.models.get(modelName);
    }
}

module.exports = Manager;