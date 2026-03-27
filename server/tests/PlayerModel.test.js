// Load environment variables from .env file for MongoDB connection
require('dotenv').config({ path: './.env' })

// Use Google's DNS to resolve MongoDB SRV records on Windows
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

// Import Mongoose library
const mongoose = require("mongoose");

// Import User and Player models
const User = require("../models/User");
const Player = require("../models/Player");
const Team = require("../models/Team");

describe("Player Model Test", () => {

    // Connect to MongoDB Atlas before running tests
    beforeAll(async () => {
       await mongoose.connect(process.env.MONGODB_URI  + "-test");
    }, 10000)

    beforeEach(async () => {
        await User.deleteMany({})
        await Player.deleteMany({})
        await Team.deleteMany({})
        await Player.syncIndexes();
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    // Create player
    test("should create and save a player successfully", async () => {
        const player = new Player({
            username: "TestPlayer",
            email: "test@example.com",
            password: "securepassword",
            imageURL: "http://example.com/image.png",
            teamId: new mongoose.Types.ObjectId(),
            coach: new mongoose.Types.ObjectId(),
            rank: "Gold II",
            rr: 950,
            level: 30
        });

        const savedPlayer = await player.save();

        expect(savedPlayer._id).toBeDefined();
        expect(savedPlayer.coach.toString()).toEqual(player.coach.toString());
        expect(savedPlayer.rank).toBe("Gold II");
        expect(savedPlayer.level).toBe(30);
    });

    // Required fields validation
    test("should fail if required fields are missing", async () => {
        const player = new Player({ rank: "Silver I" });

        let err;
        try {
            await player.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeDefined();
    });

    // Enum validation for rank
    test("should fail if rank is not in the enum", async () => {
        const player = new Player({
            username: "TestPlayer",
            email: "test@example.com",
            password: "securepassword",
            coach: new mongoose.Types.ObjectId(),
            rank: "Super Duper", // invalid rank
            rr: 500,
            level: 10
        });

        let err;
        try {
            await player.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeDefined();
        expect(err.errors.rank).toBeDefined();
    });

    // Virtual: test matchesPlayed calculation
    test("should correctly calculate matchesPlayed virtual", async () => {
        const player = new Player({
            username: "TestPlayer",
            email: "test@example.com",
            password: "securepassword",
            coach: new mongoose.Types.ObjectId(),
            rank: "Gold I",
            level: 20,
            stats: {
                wins: 10,
                losses: 5
            }
        });

        expect(player.matchesPlayed).toBe(15);
    });

    // Virtual: test winRate calculation
    test("should correctly calculate winRate virtual", async () => {
        const player = new Player({
            username: "TestPlayer",
            email: "test@example.com",
            password: "securepassword",
            coach: new mongoose.Types.ObjectId(),
            rank: "Platinum I",
            rr: 1200,
            level: 40,
            stats: {
                wins: 8,
                losses: 12
            }
        });
        expect(player.winRate).toBe("40.00");
    });

    // Virtual: test kdRatio calculation (kills/deaths)
    test("should correctly calculate kdRatio", async () => {
        const player = new Player({
            username: "TestPlayer",
            email: "test@example.com",
            password: "securepassword",
            coach: new mongoose.Types.ObjectId(),
            rank: "Silver I",
            rr: 700,
            level: 15,
            stats: {
                kills: 20,
                deaths: 10
            }
        });

        expect(player.kdRatio).toBe("2.00");
    });

    // Virtual: test kadRatio calculation ((kills + assists) / deaths)
    test("should calculate kadRatio correctly", async () => {
        const player = new Player({
            username: "TestPlayer",
            email: "test@example.com",
            password: "securepassword",
            coach: new mongoose.Types.ObjectId(),
            rank: "Diamond I",
            rr: 1500,
            level: 50,
            stats: {
                kills: 30,
                assists: 10,
                deaths: 10
            }
        });
        expect(player.kadRatio).toBe("4.00");
    });

    // Virtual: test headshotPercentage calculation
    test("should calculate headshot, body, and legshot percentages correctly", async () => {
        const player = new Player({
            username: "TestPlayer",
            email: "test@example.com",
            password: "securepassword",
            coach: new mongoose.Types.ObjectId(),
            rank: "Immortal I",
            rr: 1800,
            level: 60,
            stats: {
                headshots: 25,
                bodyshots: 50,
                legshots: 25
            }
        });

        expect(player.headshotPercentage).toBe("25.00");
        expect(player.bodyshotPercentage).toBe("50.00");
        expect(player.legshotPercentage).toBe("25.00");
    });


    // Method: addMatch limit
    test("should only keep last 20 matches", async () => {
        const player = new Player({
            username: "TestPlayer",
            email: "test@example.com",
            password: "securepassword",
            coach: new mongoose.Types.ObjectId(),
            rank: "Gold I",
            rr: 900,
            level: 25
        });

        for (let i = 0; i < 25; i++) {
            player.addMatch({
                match: new mongoose.Types.ObjectId(),
                result: "Win"
            });
        }

        expect(player.last20Matches.length).toBe(20);
    });

});