const User = require('../models/User');
const Player = require('../models/Player');
const Coach = require('../models/Coach');
const bcrypt = require('bcrypt'); 

// Create (Player or Coach)
exports.create = async (req, res) => {
  try {
    const { username, email, password, role, ...rest } = req.body;
    const imageURL = req.file ? req.file.path : ''; // added this line


    // basic validation
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;

    if (role === 'Player') {
      user = new Player({
        username,
        email,
        password: hashedPassword,
        imageURL, // add this
        ...rest // rank, level, etc.
      });
    } 
    else if (role === 'Coach') {
      user = new Coach({
        username,
        email,
        password: hashedPassword,
        imageURL, // add this
        ...rest
      });
    } 
    else {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
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

        isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({
            message: 'Login successful',
            user: userObj
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

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