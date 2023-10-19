const express = require('express');
const router = express.Router();
const authCheck = require('../middlewares/auth')
const ContactsController = require('../controllers/ContactsController');

router.get('/', authCheck,ContactsController.searchUser);
router.get('/contact',authCheck,ContactsController.searchUserById);
router.post('/report',authCheck,ContactsController.reportContact);

module.exports = router;