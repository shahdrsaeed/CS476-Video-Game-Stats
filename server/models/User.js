const mongoose = require('mongoose');

// Define the User schema with discriminator key to support inheritance for Player and Coach
const options = {
    discriminatorKey: 'role',
    timestamps: true,
};

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    }
}, options)

module.exports = mongoose.model("User", UserSchema)