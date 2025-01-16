module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'CommandRole',
        {
            guildId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            commandName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            roleId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            tableName: 'CommandRoles',
            timestamps: false,
        }
    );
};