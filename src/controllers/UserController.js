// src/controllers/UserController.js
const User = require('../models/User.js');
const bcrypt = require('bcrypt');
const uuid = require("uuid");
const jwt = require('jsonwebtoken');

exports.createUser = async (req, res) => {
  try {
    const email = req.body.email;
    const plainPassword = req.body.password;
    const name = req.body.name;
    const uniqueId = uuid.v4();
    const contact_number = req.body.contact_number;

    // Check if a user with the given phone number already exists
    const existingUser = await User.findOne({ where: { contact_number: contact_number } });
    if (existingUser) {
      return res.status(400).json({
        message: "User with credentials already exists. Please login",
      });
    }

    // Check if a user with the given email already exists
    const existingEmailUser = await User.findOne({ where: { email: email } });
    if (existingEmailUser) {
      return res.status(400).json({
        error: "Bad Request",
        message: "User with this email already exists",
      });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await User.create({
      contact_number: contact_number,
      name: name,
      email: email,
      uuid: uniqueId,
      password: hashedPassword,
    });
    
    return res.status(201).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.login = async (req, res) => {
  try {
    const contact_number = req.body.contact_number;
    const user = await User.findOne({ where: { contact_number: contact_number } });
    if (!user) {
      return res.status(400).json({
        message: 'Auth failed'
      });
    }
    bcrypt.compare(req.body.password, user.password, (err, result) => {
      //comparion fails due to some internal error
      if (err) {
        return res.status(400).json({
          message: 'Auth failed'
        });
      }
      //success
      if (result) {
        const token = jwt.sign({
          contact_number: req.body.contact_number,
          user_id: user.uuid,
          name: user.name,
        }, process.env.SECRET, {
          expiresIn: "2h"
        })
        return res.status(200).json({
          message: 'Login Successful',
          token: token
        });
      }
      //fail due to incorrect password
      return res.status(400).json({
        message: 'Auth failed'
      });
    })
  }
  catch (error) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
    });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const [updatedRowsCount, updatedUsers] = await User.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });

    if (updatedRowsCount === 0)
      return res.status(404).json({ message: 'User not found' });

    return res.status(200).json(updatedUsers[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deletedRowCount = await User.destroy({
      where: { id: req.params.id },
    });

    if (deletedRowCount === 0)
      return res.status(404).json({ message: 'User not found' });

    return res.status(204).end();
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
};
