module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Owner',
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            tableName: 'Owners',
            timestamps: true,
        }
    );
};