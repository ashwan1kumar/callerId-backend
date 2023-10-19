const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const Contacts = sequelize.define('Contacts', {
    contact_number: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    not_spam_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    spam_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    spam_probability:{
        type: DataTypes.FLOAT,
        allowNull: false,
    },
});

module.exports = Contacts;