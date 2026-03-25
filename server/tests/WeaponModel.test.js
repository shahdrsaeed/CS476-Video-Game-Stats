// Load environment variables from .env file for MongoDB connection
require('dotenv').config({ path: './.env' })

// Use Google's DNS to resolve MongoDB SRV records on Windows
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

// Import Mongoose library
const mongoose = require("mongoose")

// Import Weapon model
const Weapon = require("../models/submodel/Weapon")

describe("Weapon Model Test", () => {

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
    await Weapon.deleteMany({})
    await Weapon.syncIndexes();
  })

  // Test that a valid weapon saves successfully
  test("should create & save weapon successfully", async () => {
    const validWeapon = new Weapon({
      name: "Vandal",
      type: "Rifle",
      description: "The Vandal is a fully automatic rifle that deals consistent damage at any range. It is one of the most popular weapons in the game due to its high damage output and versatility.",
      fireMode: "Automatic",
      rateOfFire: 9.75,
      magazineCapacity: 25,
      wallPenetration: "Medium",
      advantages: [
        { title: "One shot headshot", explanation: "Can kill an enemy with a single headshot at any range." },
        { title: "Consistent damage", explanation: "Unlike some rifles, its damage does not fall off at longer ranges." },
        { title: "Versatile", explanation: "Effective at both close and long range engagements." }
      ],
      disadvantages: [
        { title: "Expensive", explanation: "Costs 2900 credits, making it a significant investment each round." },
        { title: "Difficult to control", explanation: "Its recoil pattern requires practice to master, especially during sustained fire." },
        { title: "Slow fire rate", explanation: "Compared to the Phantom, it has a slower rate of fire which can be a disadvantage in close range." }
      ],
      imageUrl: "Vandal.png"
    })
    const savedWeapon = await validWeapon.save()

    // Verify the weapon was saved with the correct values
    expect(savedWeapon._id).toBeDefined()
    expect(savedWeapon.name).toBe("Vandal")
    expect(savedWeapon.type).toBe("Rifle")
    expect(savedWeapon.fireMode).toBe("Automatic")
    expect(savedWeapon.rateOfFire).toBe(9.75)
    expect(savedWeapon.magazineCapacity).toBe(25)
    expect(savedWeapon.wallPenetration).toBe("Medium")
    expect(savedWeapon.advantages).toHaveLength(3)
    expect(savedWeapon.disadvantages).toHaveLength(3)
  })

  // Test that required fields are enforced
  test("should fail if required fields are missing", async () => {
    const invalidWeapon = new Weapon({ name: "Vandal" }) // missing type and description
    let err
    try {
      await invalidWeapon.save()
    } catch (error) {
      err = error
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(err.errors.type).toBeDefined()          // type was missing
    expect(err.errors.description).toBeDefined()   // description was missing
  })

  // Test that two weapons cannot share the same name
  test("should fail if name is not unique", async () => {
    const firstWeapon = new Weapon({
      name: "Vandal",
      type: "Rifle",
      description: "A fully automatic rifle."
    })
    await firstWeapon.save()

    const duplicateWeapon = new Weapon({
      name: "Vandal", // same name, should fail
      type: "SMG",
      description: "A different weapon."
    })
    let err
    try {
      await duplicateWeapon.save()
    } catch (error) {
      err = error
    }
    expect(err).toBeDefined()
  })

  // Test that optional fields can be omitted without error
  test("should save successfully without optional fields", async () => {
    const weaponWithoutOptionals = new Weapon({
      name: "Classic",
      type: "Sidearm",
      description: "A reliable sidearm available to all players for free at the start of each round."
      // no fireMode, rateOfFire, magazineCapacity, wallPenetration, advantages, disadvantages, or imageUrl
    })
    const savedWeapon = await weaponWithoutOptionals.save()

    expect(savedWeapon._id).toBeDefined()
    expect(savedWeapon.fireMode).toBeUndefined()
    expect(savedWeapon.rateOfFire).toBeUndefined()
    expect(savedWeapon.magazineCapacity).toBeUndefined()
    expect(savedWeapon.wallPenetration).toBeUndefined()
    expect(savedWeapon.advantages).toHaveLength(0)
    expect(savedWeapon.disadvantages).toHaveLength(0)
    expect(savedWeapon.imageUrl).toBeUndefined()
  })

  // Test that wallPenetration enum is enforced
  test("should fail if wallPenetration is not a valid enum value", async () => {
    const invalidWeapon = new Weapon({
      name: "Phantom",
      type: "Rifle",
      description: "A fully automatic rifle.",
      wallPenetration: "Ultra" // not a valid enum value
    })
    let err
    try {
      await invalidWeapon.save()
    } catch (error) {
      err = error
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(err.errors.wallPenetration).toBeDefined()
  })

  test("should fail if rateOfFire or magazineCapacity is negative", async () => {
  const invalidWeapon = new Weapon({
    name: "Phantom",
    type: "Rifle",
    description: "A fully automatic rifle.",
    rateOfFire: -5,       // invalid
    magazineCapacity: -10 // invalid
  })
  let err
  try {
    await invalidWeapon.save()
  } catch (error) {
    err = error
  }
  expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
  expect(err.errors.rateOfFire).toBeDefined()
  expect(err.errors.magazineCapacity).toBeDefined()
  })
})