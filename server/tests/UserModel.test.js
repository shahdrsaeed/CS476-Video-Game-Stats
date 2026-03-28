// Load environment variables from .env file for MongoDB connection
require('dotenv').config({ path: './.env' })

// Use Google's DNS to resolve MongoDB SRV records on Windows
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

// Import Mongoose library
const mongoose = require("mongoose")

// Import User model
const User = require("../models/User")
const Team = require("../models/Team")

describe("User Model Test", () => {

  // Connect to MongoDB Atlas before running tests
    beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI  + "-test");
  }, 10000)

  // Close connection after tests
  afterAll(async () => {
    await mongoose.connection.close()
  })

  // Clear the database before each test
  beforeEach(async () => {
    await User.deleteMany({})
    await User.syncIndexes()
  })

  // Test case for creating a user successfully
  test("should create & save user successfully", async () => {
    const validUser = new User({
      username: "testuser",
      email: "test@email.com",
      password: "hashedpassword",
      imageURL: "http://example.com/image.jpg",
      teamId: new mongoose.Types.ObjectId(),
    })
    const savedUser = await validUser.save()
    expect(savedUser._id).toBeDefined()
    expect(savedUser.username).toBe("testuser")
    expect(savedUser.email).toBe("test@email.com")
  })

  // Test case for missing required fields
  test("should fail if required fields missing", async () => {
    const invalidUser = new User({ username: "testuser" })
    let err
    try {
      await invalidUser.save()
    } catch (error) {
      err = error
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(err.errors.email).toBeDefined()
    expect(err.errors.password).toBeDefined()
  })

  // Test case for unique username and email
  test("should fail if username or email is not unique", async () => {
  const firstUser = new User({
    username: "testuser",
    email: "test@email.com",
    password: "hashedpassword",
    imageURL: "http://example.com/image.jpg",
    teamId: new mongoose.Types.ObjectId(),
  })
  await firstUser.save()

  const duplicateUser = new User({
    username: "testuser", // duplicate username
    email: "test@email.com", // duplicate email
    password: "differentpassword",
    imageURL: "http://example.com/image.jpg",
    teamId: new mongoose.Types.ObjectId(),
  })

  let err
  try {
    await duplicateUser.save()
  } catch (error) {
    err = error
  }

  expect(err).toBeDefined()
  expect(err.code).toBe(11000) // MongoDB duplicate key error
  })
})