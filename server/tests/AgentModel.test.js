const mongoose = require("mongoose")

const Agent = require("../models/submodel/Agent")

describe("Agent Model Test", () => {

  // Connect to MongoDB before running tests
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/agent-test");
  })

  // Close connection after tests
  afterAll(async () => {
    await mongoose.connection.close()
  })

  // Clear the database before each test
  beforeEach(async () => {
    await Agent.deleteMany({})
  })

  // Test that a valid agent saves successfully
  test("should create & save agent successfully", async () => {
    const validAgent = new Agent({
      agentName: "Phoenix",
      role: "Duelist",
      description: "Phoenix is an aggressive duelist who specializes in self-sustain and entry fragging. His kit revolves around fire-based abilities that can suppress enemies and heal himself.",
      advantages: 
      [
        { title: "Self-healing", explanation: "His fire abilities restore his health, letting him stay in fights longer." },
        { title: "Excels at initiating combat ", explanation: "His flash and wall allow him to push into contested areas effectively." },
        { title: "Second life", explanation: "His ultimate revives him when he is killed during a round, allowing him to play aggressively with low risk." },
        { title: "Beginner friendly", explanation: "His abiliites are simple and intuitive, making his playstyle easy to learn for new players." }
      ],
      disadvantages: 
      [
        { title: "Short range utility", explanation: "His flashes and walls require close positioning to be effective." },
        { title: "Predictable playstyle", explanation: "Experienced players can anticipate Phoenix pushes." },
        { title: "Limited team utiltity", explanation: "Compared to other duelists or controllers, he offers less support to his teammates." },
        { title: "Vulnerable during ultimate return", explanation: "Enemies can camp his return location after his ultimate ends." }
      ],
      abilities: 
      [
        { name: "Curveball", description: "Throws a curved flash that blinds enemies around corners." },
        { name: "Hot Hands", description: "Throws a fireball that creates a burning area on the ground, damaging enemies while healing Phoenix." },
        { name: "Blaze", description: "Creates a wall of fire that blocks vision and damages enemies who pass through it. Phoenix can bend the wall slightly and heal while standing in it." },
        { name: "Run it Back", description: "Marks Phoenix's current location. If he dies during the ability's duration, he will respawn at that marked spot with full health." }
      ],
      difficulty: "Easy",
      imageURL: "Phoenix.png"
    })
    const savedAgent = await validAgent.save()

    // Verify the agent was saved with the correct values
    expect(savedAgent._id).toBeDefined()
    expect(savedAgent.agentName).toBe("Phoenix")
    expect(savedAgent.role).toBe("Duelist")
    expect(savedAgent.abilities).toHaveLength(4)
  })

  // Test that required fields are enforced
  test("should fail if required fields are missing", async () => {
    const invalidAgent = new Agent({ agentName: "Phoenix" }) // missing role and description
    let err
    try {
      await invalidAgent.save()
    } catch (error) {
      err = error
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(err.errors.role).toBeDefined()        // role was missing
    expect(err.errors.description).toBeDefined() // description was missing
  })

  // Test that two agents cannot share the same name
  test("should fail if agentName is not unique", async () => {
    const firstAgent = new Agent({
      agentName: "Phoenix",
      role: "Duelist",
      description: "A fire-based duelist"
    })
    await firstAgent.save()

    const duplicateAgent = new Agent({
      agentName: "Phoenix", // same name, should fail
      role: "Controller",
      description: "A different agent"
    })
    let err
    try {
      await duplicateAgent.save()
    } catch (error) {
      err = error
    }
    expect(err).toBeDefined() // should have thrown an error
  })

})