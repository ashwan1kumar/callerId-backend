const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContactConnections = sequelize.define('ContactConnections', {
    uuid: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
    },
    added_by: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contact_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contact_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // possibly store spam probabilty here  --> or use redis
});

module.exports = ContactConnections;