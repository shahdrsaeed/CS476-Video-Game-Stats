const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

// Auth
router.post('/register', userController.register);
router.post('/login', userController.login);

// User
router.get('/:id', userController.getUserById);
router.delete('/:id', userController.deleteUser);

module.exports = router;