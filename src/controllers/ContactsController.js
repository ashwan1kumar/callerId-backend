const Contacts = require('../models/Contacts');
const Relations = require('../models/ContactConnections');
const Users = require('../models/User');
const { Op } = require('sequelize');
exports.searchUser = async (req, res, next) => {
    try {
        const searchString = req.query.query;
        let result;
        // first search if this is registered user in case of phone number
        if (isNaN(parseInt(searchString))) {
            let cachedData = await req.app.locals.redisClient.get(`stringMatch_${searchString}`);
            if (cachedData) {
                result = cachedData;
            }
            else {
                const startsWithResults = await Relations.findAll({
                    where: {
                        contact_name: {
                            [Op.iLike]: `${searchString}%`,
                        }
                    },
                    attributes: {
                        exclude: ['uuid', 'added_by'],
                    }
                });
                const containsResults = await Relations.findAll({
                    where: {
                        contact_name: {
                            [Op.iLike]: `%${searchString}%`,
                            [Op.notILike]: `${searchString}%`,
                        }
                    },
                    attributes: {
                        exclude: ['uuid', 'added_by'],
                    }
                });
                result = [...startsWithResults, ...containsResults];
                await req.app.locals.redisClient.setex(`stringMatch_${searchString}`, 3600, JSON.stringify(result));
            }

            for (let i = 0; i < result.length; i++) {
                //check for redis cache here
                cachedData = await req.app.locals.redisClient.get(`spamProbabilty_${result[i].contact_number}`);
                if (cachedData) {
                    result[i].dataValues.spam_probability = cachedData;
                }
                else {
                    let data = await Contacts.findOne({
                        where: {
                            contact_number: result[i].contact_number,
                        }
                    });
                    if (!data) {
                        await req.app.locals.redisClient.setex(`spamProbability_${result[i].contact_number}`, 900, JSON.stringify(0));
                        result[i].dataValues.spam_probability = 0;
                    }
                    else {
                        await req.app.locals.redisClient.setex(`spamProbability_${result[i].contact_number}`, 900, JSON.stringify(data.spam_probability * 100));
                        result[i].dataValues.spam_probability = data.spam_probability * 100;
                    }
                }
            }
        }
        else {
            result = await Users.findOne({
                where: { contact_number: searchString },
                attributes: { exclude: ['password'] },
            });
            if (!result) {
                const data = await Relations.findAll({
                    where: {
                        contact_number: searchString
                    },
                    attributes: {
                        exclude: ['uuid', 'added_by'],
                    }
                })
                if (!data.length) {
                    return res.status(400).json({
                        message: 'Sorry we dont have this number in our database'
                    })
                }
                result = data;
            }
            const showEmail = await Relations.findAll({
                where: {
                    contact_number: req.userData.contact_number,
                    added_by: searchString,
                }
            })
            // for when we get a contact that is registered user
            if (!result.length) {
                let data = await Contacts.findOne({
                    where: {
                        contact_number: result.contact_number,
                    }
                });
                if (!data) {
                    result.dataValues.spam_probability = 0;

                }
                else {
                    result.dataValues.spam_probability = data.spam_probability * 100;
                }
                if (!showEmail.length) {
                    delete result.dataValues.email;
                }
            }
            for (let i = 0; i < result.length; i++) {
                //check for redis cache here
                let cachedData = await req.app.locals.redisClient.get(`spamProbability_${result[i].contact_number}`);
                if (cachedData) {
                    result[i].dataValues.spam_probability = cachedData;
                }
                else {

                    let data = await Contacts.findOne({
                        where: {
                            contact_number: result[i].contact_number,
                        }
                    });
                    if (!data) {
                        await req.app.locals.redisClient.setex(`spamProbability_${result[i].contact_number}`, 900, JSON.stringify(0));
                        result[i].dataValues.spam_probability = 0;

                    }
                    else {
                        await req.app.locals.redisClient.setex(`spamProbability_${result[i].contact_number}`, 900, JSON.stringify(data.spam_probability * 100));
                        result[i].dataValues.spam_probability = data.spam_probability * 100;
                    }
                }
            }

        }

        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({ message: 'Something went wrong' });

    }
};

exports.reportContact = async (req, res, next) => {
    let isSpam = req.body.isSpam;
    let contact_number = req.body.contact_number;

    try {
        const contact = await Contacts.findOne({
            where: {
                contact_number: contact_number,
            },
        });

        if (!contact) {
            // If the contact is not found, create a new entry in the table
            const newContact = await Contacts.create({
                contact_number: contact_number,
                spam_count: isSpam ? 1 : 0,
                not_spam_count: isSpam ? 0 : 1,
                spam_probability: isSpam ? 1 : 0,
            });
            console.log(newContact);
            return res.status(200).json({ message: 'Thanks for reporting' });
        }
        console.log(contact);
        let spam_count = contact.spam_count;
        let not_spam_count = contact.not_spam_count;
        if (isSpam) {
            contact.spam_count = (contact.spam_count || 0) + 1;
            contact.spam_probability = ((spam_count + 1) / (spam_count + not_spam_count + 1));
        } else {
            contact.not_spam_count = (contact.not_spam_count || 0) + 1;
            contact.spam_probability = (spam_count) / (spam_count + not_spam_count + 1);

        }

        // Save the changes back to the database
        await contact.save();

        return res.status(200).json({ message: 'Thanks for reporting' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.searchUserById = async (req, res, next) => {
    try {
        const contact_number = req.body.id;
        const name = req.body.name;
        const showEmail = await Relations.findAll({
            where: {
                contact_number: req.userData.contact_number,
                added_by: contact_number,
            }
        })
        let user = await Users.findOne({
            where: {
                contact_number: contact_number
            },
            attributes:{
                exclude:['uuid','password'],
            }
        });
        if (!user) {
            user = Relations.findOne({
                where: {
                    contact_name: name,
                    contact_number: contact_number,
                }
            });
        }
        const data = await Contacts.findOne({
            where: {
                contact_number: contact_number,
            }
        });
        if (!data) {
            user.dataValues.spam_probability = 0;
        }
        else {
            user.dataValues.spam_probability = data.spam_probability * 100;
        }
        if (!showEmail.length) {
            delete user.dataValues.email;
        }
        console.log(user);
        return res.status(200).json(user);
    }
    catch (err) {
        return res.status(500).json({
            message: 'Something went Wrong',
        })
    }
};
