const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const header = req.header('Authorization');

    if (!header) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = header.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        req.user = decoded; // ✅ attaches user info
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = auth;