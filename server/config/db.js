// Handles the connection to the MongoDB Atlas database using Mongoose

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Use Google's DNS to resolve MongoDB SRV records on Windows

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process if connection fails
  }
};

module.exports = connectDB;