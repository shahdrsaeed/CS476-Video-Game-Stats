const Player = require('../models/Player');
const Coach = require('../models/Coach');
const bcrypt = require('bcrypt');

/**
 * UserFactory - simple factory for creating player and coach users centralizes
 * construction logic, validation, and password hashing so controllers don't know how each user type is built
 */

class UserFactory {

    /**
     * Create a new user of the specified role
     * @param {String} role
     * @param {Object} data
     * @param {String} imageURL
     * @returns {Promise<Document>}
     */

    static async create(role, data, imageURL) {
        const {username, email, password, ...rest} = data;

        const hashedPassword = await bcrypt.hash(password, 10);

        const base = {
            username,
            email,
            password: hashedPassword,
            imageURL,
            ...rest
        };

        switch (role) {
            case 'Player':
                return new Player(base);

            case 'Coach':
                return new Coach(base);

            default:
                throw new Error(`Invalid role: ${role}`);
        }
    }
}

module.exports = UserFactory;