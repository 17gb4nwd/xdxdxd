module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'GiveawaySetting',
        {
            guildId: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
            },
            prize: {
                type: DataTypes.STRING,
                defaultValue: 'Nitro',
                allowNull: false,
            },
            duration: {
                type: DataTypes.INTEGER,
                defaultValue: 600000,
                allowNull: false,
            },
            emoji: {
                type: DataTypes.STRING,
                defaultValue: '🎉',
                allowNull: false,
            },
            channelId: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            winners: {
                type: DataTypes.INTEGER,
                defaultValue: 1,
                allowNull: false,
            },
            prohibitedRoles: {
                type: DataTypes.JSON,
                defaultValue: [],
            },
            requiredRoles: {
                type: DataTypes.JSON,
                defaultValue: [],
            },
            requireVoice: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            predefinedWinnerId: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            tableName: 'GiveawaySettings',
            timestamps: false,
        }
    );
};
