const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // fixed path
const { upload } = require('../config/cloudinary');
const User = require('../models/User');


// Auth
router.post('/create', upload.single('avatar'), userController.create); // only change is adding upload.single('avatar')
router.post('/login', userController.login);

// User
router.get('/:id', userController.getUserById);
router.delete('/:id', userController.deleteUser);

// Profile picture upload
router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { userId } = req.body; // we'll pass userId in the request for now
    await User.findByIdAndUpdate(userId, { imageURL: req.file.path });
    res.json({ imageURL: req.file.path });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;