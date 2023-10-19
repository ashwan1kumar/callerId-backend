require('dotenv').config();

const sequelize = require('./../config/database');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const Users = require('../models/User');
const Relations = require('../models/ContactConnections');
const Contacts = require('../models/Contacts');
function generateRandomNumbers(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
function randomNames() {
    let names = ['ashwani', 'jio', 'instahyre', 'anuj', 'sample', 'john', 'doe', 'silver', 'rze'];
    return names[generateRandomNumbers(0, names.length)] + ' ' + names[generateRandomNumbers(0, names.length)];
}
function randomEmail() {
    return randomNames() + generateRandomNumbers(0, 100000) + '@gmail.com';
}
(async () => {
    try {
        await sequelize.sync();
        const usersData = [];
        const contactsData = [];
        const relationsData = [];

        for (let i = 0; i < 250; i++) {
            let passHash = await bcrypt.hash('password', 10);
            let contact_number = generateRandomNumbers(1111111111, 9999999999);
            usersData.push({
                contact_number: contact_number,
                name: randomNames(),
                email: randomEmail(),
                uuid: uuid.v4(),
                password: passHash,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            contactsData.push({
                contact_number: contact_number,
                spam_count: generateRandomNumbers(0, 100),
                not_spam_count: generateRandomNumbers(0, 100),
                spam_probability: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            relationsData.push({
                added_by:generateRandomNumbers(1111111111,9999999999),
                contact_number:contact_number,
                contact_name:randomNames(),
                createdAt: new Date(),
                updatedAt: new Date(),
                uuid:uuid.v4(),
            })
        }
        await Users.bulkCreate(usersData);
        await Relations.bulkCreate(relationsData);
        await Contacts.bulkCreate(contactsData);
        console.log('Data inserted successfully.')
    }
    catch (err) {
        console.log('Error inserting data:',err);
    }
})();