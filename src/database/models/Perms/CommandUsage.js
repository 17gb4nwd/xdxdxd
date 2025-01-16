module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'CommandUsage',
        {
            guildId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            userId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            commandName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            usageCount: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            lastUsed: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            tableName: 'CommandUsages',
            timestamps: false,
        }
    );
};