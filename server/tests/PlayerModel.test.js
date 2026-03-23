const mongoose = require("mongoose");
const User = require("../models/User");
const Player = require("../models/Player");

describe("Player Model Test", () => {

    beforeAll(async () => {
        await mongoose.connect("mongodb://127.0.0.1:27017/player-test");
    });

    beforeEach(async () => {
        await User.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    // Create player
    test("should create and save a player successfully", async () => {
        const player = new Player({
            username: "TestPlayer",
            email: "test@example.com",
            password: "securepassword",
            coach: new mongoose.Types.ObjectId(),
            rank: "Gold II",
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
        expect(err.errors.coach).toBeDefined();
        expect(err.errors.level).toBeDefined();
    });

    // Enum validation for rank
    test("should fail if rank is not in the enum", async () => {
        const player = new Player({
            username: "TestPlayer",
            email: "test@example.com",
            password: "securepassword",
            coach: new mongoose.Types.ObjectId(),
            rank: "Super Duper", // invalid rank
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

    // Virtual: test kdRatio calculation (kills/deaths)
    test("should correctly calculate kdRatio", async () => {
        const player = new Player({
            username: "TestPlayer",
            email: "test@example.com",
            password: "securepassword",
            coach: new mongoose.Types.ObjectId(),
            rank: "Silver I",
            level: 15,
            stats: {
                kills: 20,
                deaths: 10
            }
        });

        expect(player.kdRatio).toBe("2.00");
    });

    // Method: addMatch limit
    test("should only keep last 20 matches", async () => {
        const player = new Player({
            username: "TestPlayer",
            email: "test@example.com",
            password: "securepassword",
            coach: new mongoose.Types.ObjectId(),
            rank: "Gold I",
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