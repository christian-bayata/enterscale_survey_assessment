const request = require("supertest");
const Company = require("../../models/company");
const Question = require("../../models/question");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Survey = require("../../models/survey");

let server;
let baseURL = "/api/question";

describe("Question Controller", () => {
  beforeAll(() => {
    server = require("../../server");
  });

  afterEach(async () => {
    await Company.deleteMany({});
    await Question.deleteMany({});
  });

  afterAll(async () => {
    server.close();
    mongoose.disconnect();
  });

  /************************* Create Survey Question(s) **********************************/
  describe("Create Survey Question(s)", () => {
    it("should fail if the question is missing from payload", async () => {
      const jwtToken = new Company({ _id: mongoose.Types.ObjectId(), email: "some_email@gmail.com" }).generateJsonWebToken();
      const payload = {
        survey: mongoose.Types.ObjectId(),
      };

      const response = await request(server).post(`${baseURL}/create-question`).set("authorization", jwtToken).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/question/i);
      expect(response.body.message).toMatch(/required/i);
    });

    it("should fail if the survey is missing from payload", async () => {
      const jwtToken = new Company({ _id: mongoose.Types.ObjectId(), email: "some_email@gmail.com" }).generateJsonWebToken();
      const payload = {
        question: "some_valid_question",
      };

      const response = await request(server).post(`${baseURL}/create-question`).set("authorization", jwtToken).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/survey/i);
      expect(response.body.message).toMatch(/required/i);
    });

    it("should succeed if all requirements are met", async () => {
      const jwtToken = new Company({ _id: mongoose.Types.ObjectId(), email: "some_email@gmail.com" }).generateJsonWebToken();

      let theSurvey = await Survey.create({
        title: "some survey title 1",
      });

      const payload = {
        survey: theSurvey._id,
        question: "some_valid_question",
      };

      const response = await request(server).post(`${baseURL}/create-question`).set("authorization", jwtToken).send(payload);
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/successfully created question/i);
    });
  });
});
