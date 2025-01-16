module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Bypass',
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
            tableName: 'Bypasses',
            timestamps: true,
        }
    );
};