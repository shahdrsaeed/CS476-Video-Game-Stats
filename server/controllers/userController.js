const User = require('../models/User');
const UserFactory = require('../factories/UserFactory');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Create (Player or Coach)
exports.create = async (req, res) => {
  try {
    const { username, email, password, role, ...rest } = req.body;
   const imageURL = req.file ? req.file.secure_url : '';

    // basic validation
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const user = await UserFactory.create(role, { username, email, password, ...rest}, imageURL);

    // Only reached for Player
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user
    });

  } catch (err) { // catches both factory errors and DB errors
    const status = err.message.startsWith('Invalid role') ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // basic validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Missing email or password' });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                teamId: user.teamId
            },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '7d' }
        );

        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({
            message: 'Login successful',
            token,
            user: userObj
      });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    .populate('teamId', 'teamName') // ← add this
    .populate('coach', 'username imageURL title');  // ← add this

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userObj = user.toObject();
    delete userObj.password;

    res.json(userObj);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};