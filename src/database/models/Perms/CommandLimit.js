module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'CommandLimit',
        {
            guildId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            commandName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            limit: {
                type: DataTypes.INTEGER,
                defaultValue: 5,
            },
        },
        {
            tableName: 'CommandLimits',
            timestamps: false,
        }
    );
};