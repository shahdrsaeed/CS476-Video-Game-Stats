const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // fixed path

// Auth
router.post('/create', userController.create);
router.post('/login', userController.login);

// User
router.get('/:id', userController.getUserById);
router.delete('/:id', userController.deleteUser);

module.exports = router;