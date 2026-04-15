const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");

describe("Express App Tests", () => {
  afterAll(async () => {
    // Close mongoose connection after tests finish to avoid jest hanging
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  describe("GET /", () => {
    it("should return the default message for backend", async () => {
      const response = await request(app).get("/");
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("EV Trip Planner API");
    });
  });

  describe("API 404", () => {
    it("should return 404 for an unknown endpoint", async () => {
      const response = await request(app).get("/api/unknown-endpoint");
      expect(response.statusCode).toBe(404);
    });
  });
});
