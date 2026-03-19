// import Mongoose library
const mongoose = require('mongoose');

//Define the map model in mongoose
const MapSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: true, // every map must have a name
        unique: true // no two maps can share the same name
    },
    siteAmount: { // all maps either have 2 or 3 sites
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true // every map must have a description for the archive
    },
    imageUrl: {
        type: String // optional - for displaying image of Map in the archive
    } 
});

// Export model so that other files can use it
module.exports = mongoose.model('Map', MapSchema);