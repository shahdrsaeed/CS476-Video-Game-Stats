// Load environment variables from .env file for MongoDB connection
require('dotenv').config({ path: './.env' })

// Use Google's DNS to resolve MongoDB SRV records on Windows
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

// Import Mongoose library
const mongoose = require("mongoose")

// Import Map model
const Map = require("../models/submodel/Map");

describe("Map Model Test", () => {

    // Connect to MongoDB Atlas before running tests
    beforeAll(async () => {
       await mongoose.connect(process.env.MONGODB_URI  + "-test");
    }, 10000)
   
    // Close connection after tests
    afterAll(async () => {
        await mongoose.connection.close()
    })

    // Clear database before each test
    beforeEach(async () => {
        await Map.deleteMany({})
        await Map.syncIndexes();
    })

    // Test that a valid map saves successfully
    test("should create & save map successfully", async () => {
        const validMap = new Map({
            name: "Icebox",
            siteAmount: 2,
            description: "Your next battleground is a secret Kingdom excavation site overtaken by the arctic. The two plant sites protected by snow and metal require some horizontal finesse. Take advantage of the ziplines and they'll never see you coming.",
            imageUrl: "Icebox.png"
        })
        const savedMap = await validMap.save();

        // Verify the map was saved with the correct values
        expect(savedMap._id).toBeDefined()
        expect(savedMap.name).toBe("Icebox")
        expect(savedMap.siteAmount).toBe(2);
    })

    // Test that required fields are enforced
    test("should fail if required fields are missing", async () => {
        const invalidMap = new Map ({ name: "Bind" }) // missing siteAmount and description
        let err
        try {
            await invalidMap.save()
        } catch (error) {
            err = error
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
        expect(err.errors.siteAmount).toBeDefined()
        expect(err.errors.description).toBeDefined()
    })

    // test that two maps cannot share the same name
    test("should fail if name is not unique", async () => {
        const firstMap = new Map ({
            name: "Bind",
            siteAmount: 2,
            description: "Site overtaken by the arctic"
        })
        await firstMap.save()

        const duplicateMap = new Map ({
            name: "Bind",
            siteAmount: 3,
            description: "A different map"
        })
        let err
        try {
            await duplicateMap.save()
        } catch (error) {
            err = error
        }
        expect(err).toBeDefined()
    })
})