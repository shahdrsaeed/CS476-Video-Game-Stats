// Import Mongoose library
const mongoose = require("mongoose")

// Import Weapon model
const Weapon = require("../models/Weapon")

describe("Weapon Model Test", () => {

  // Connect to MongoDB before running tests
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/weapon-test");
  })

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
      weaponName: "Vandal",
      weaponType: "Rifle",
      description: "The Vandal is a fully automatic rifle that deals consistent damage at any range. It is one of the most popular weapons in the game due to its high damage output and versatility.",
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
    expect(savedWeapon.weaponName).toBe("Vandal")
    expect(savedWeapon.weaponType).toBe("Rifle")
    expect(savedWeapon.advantages).toHaveLength(3)
    expect(savedWeapon.disadvantages).toHaveLength(3)
  })

  // Test that required fields are enforced
  test("should fail if required fields are missing", async () => {
    const invalidWeapon = new Weapon({ weaponName: "Vandal" }) // missing weaponType and description
    let err
    try {
      await invalidWeapon.save()
    } catch (error) {
      err = error
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(err.errors.weaponType).toBeDefined()    // weaponType was missing
    expect(err.errors.description).toBeDefined()   // description was missing
  })

  // Test that two weapons cannot share the same name
  test("should fail if weaponName is not unique", async () => {
    const firstWeapon = new Weapon({
      weaponName: "Vandal",
      weaponType: "Rifle",
      description: "A fully automatic rifle."
    })
    await firstWeapon.save()

    const duplicateWeapon = new Weapon({
      weaponName: "Vandal", // same name, should fail
      weaponType: "SMG",
      description: "A different weapon."
    })
    let err
    try {
      await duplicateWeapon.save()
    } catch (error) {
      err = error
    }
    expect(err).toBeDefined() // should have thrown an error
  })

  // Test that optional fields can be omitted without error
  test("should save successfully without optional fields", async () => {
    const weaponWithoutOptionals = new Weapon({
      weaponName: "Classic",
      weaponType: "Sidearm",
      description: "A reliable sidearm available to all players for free at the start of each round."
      // no advantages, disadvantages, or imageUrl
    })
    const savedWeapon = await weaponWithoutOptionals.save()

    // Verify it saved fine without the optional fields
    expect(savedWeapon._id).toBeDefined()
    expect(savedWeapon.advantages).toHaveLength(0)      // empty array by default
    expect(savedWeapon.disadvantages).toHaveLength(0)   // empty array by default
    expect(savedWeapon.imageUrl).toBeUndefined()        // not provided
  })

})