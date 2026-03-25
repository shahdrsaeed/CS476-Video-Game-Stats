// Load environment variables from .env file for MongoDB connection
require('dotenv').config({ path: './.env' })

// Use Google's DNS to resolve MongoDB SRV records on Windows
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

// Import Mongoose library
const mongoose = require("mongoose");

// Import User, Coach, and Team models
const User = require("../models/User");
const Coach = require("../models/Coach");
const Team = require("../models/Team");

describe("Coach Model Test", () => {

  // Connect to MongoDB Atlas before running tests
    beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI + "-test");
  }, 10000)

  // Clear the collections before each test
  beforeEach(async () => {
    await User.deleteMany({});
    await Coach.deleteMany({});
    await Team.deleteMany({});
    await Coach.syncIndexes();
  });

  // Disconnect after tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test: Create a coach successfully
  test("should create and save a coach successfully", async () => {
    const coach = new Coach({
      username: "aliceCoach",
      email: "alice@example.com",
      password: "securepassword",
      teamId: new mongoose.Types.ObjectId() // dummy team ID for testing
    });

    const savedCoach = await coach.save();

    expect(savedCoach._id).toBeDefined();
    expect(savedCoach.username).toBe("aliceCoach");
    expect(savedCoach.email).toBe("alice@example.com");
    expect(savedCoach.teamId).toBeDefined();
  });

  // Test: Required fields are validated
  test("should fail if required fields are missing", async () => {
    const coach = new Coach({ email: "bob@example.com" }); // missing username & password
    let err;

    try {
      await coach.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.username).toBeDefined();
    expect(err.errors.password).toBeDefined();
    expect(err.errors.teamId).toBeDefined();
  });

  // Test: Unique username/email
  test("should fail if username or email is not unique", async () => {
    const firstCoach = new Coach({
      username: "charlieCoach",
      email: "charlie@example.com",
      password: "pass123",
      teamId: new mongoose.Types.ObjectId()
    });
    await firstCoach.save();

    const duplicateCoach = new Coach({
      username: "charlieCoach",  // duplicate username
      email: "charlie@example.com", // duplicate email
      password: "differentpass",
      teamId: new mongoose.Types.ObjectId()
    });

    let err;
    try {
      await duplicateCoach.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.code).toBe(11000); // Mongo duplicate key error
  });

  // Test: Linking a coach to a team
  test("should link a coach to a team", async () => {
    // Create a coach
    const coach = new Coach({
      username: "daveCoach",
      email: "dave@example.com",
      password: "pass123",
      teamId: new mongoose.Types.ObjectId()
    });
    const savedCoach = await coach.save();

    // Create a team referencing this coach
    const team = new Team({
      teamName: "Team Phoenix",
      region: "APAC",
      coach: savedCoach._id,
      players: []
    });
    const savedTeam = await team.save();

    // Populate the coach in the team
    const populatedTeam = await Team.findById(savedTeam._id).populate("coach");

    expect(populatedTeam.coach.username).toBe("daveCoach");
    expect(populatedTeam.coach.email).toBe("dave@example.com");
  });

});