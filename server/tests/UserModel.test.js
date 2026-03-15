// will need to wait for mongoDB set up before we tes
const mongoose = require("mongoose")
const User = require("../models/User")

describe("User Model Test", () => {

  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017")
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  test("should create & save user successfully", async () => {
    const validUser = new User({
      username: "testuser",
      email: "test@email.com",
      password: "hashedpassword"
    })
    const savedUser = await validUser.save()
    expect(savedUser._id).toBeDefined()
    expect(savedUser.username).toBe("testuser")
    expect(savedUser.email).toBe("test@email.com")
  })

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

})