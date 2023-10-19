// src/routes/users.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController.js');
const authCheck = require('../middlewares/auth.js')
router.post('/signup', UserController.createUser);
router.post('/login', UserController.login);
router.get('/:id',authCheck, UserController.getUserById);
router.put('/:id',authCheck, UserController.updateUser);
router.delete('/:id',authCheck, UserController.deleteUser);

module.exports = router;
