const request = require("supertest");
const Company = require("../../models/company");
const Survey = require("../../models/survey");
const Question = require("../../models/question");
const Answer = require("../../models/answer");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

let server;
let baseURL = "/api/survey";

describe("Auth Controller", () => {
  beforeAll(() => {
    server = require("../../server");
  });

  afterEach(async () => {
    await Survey.deleteMany({});
    await Company.deleteMany({});
  });

  afterAll(async () => {
    server.close();
    mongoose.disconnect();
  });

  /************************* Create company survey **********************************/
  describe("Create Company Survey", () => {
    it("should fail if company's token is not valid", async () => {
      const jwtToken = new Company({ _id: mongoose.Types.ObjectId(), email: "some_email@gmail.com" }).generateJsonWebToken();
      const payload = {
        title: "some_survey_title",
      };

      const response = await request(server).post(`${baseURL}/create-survey`).set("authorization", "0987tfvhi0okmngt543dfguioiu89ihghjkiuy").send(payload);
      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/you are unauthenticated/i);
    });

    it("should fail if user does not provide any token", async () => {
      const payload = {
        title: "some_survey_title",
      };

      const response = await request(server).post(`${baseURL}/create-survey`).set("authorization", null).send(payload);
      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/you are unauthenticated/i);
    });

    it("should fail if user does not provide a title", async () => {
      const jwtToken = new Company({ _id: mongoose.Types.ObjectId(), email: "some_email@gmail.com" }).generateJsonWebToken();
      const payload = {};

      const response = await request(server).post(`${baseURL}/create-survey`).set("authorization", jwtToken).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/provide the title/i);
    });

    it("should successfully create survey url if all requirements are met", async () => {
      const jwtToken = new Company({ _id: mongoose.Types.ObjectId(), email: "some_email@gmail.com" }).generateJsonWebToken();
      const payload = {
        title: "some_survey_title_that_is_good",
      };

      const response = await request(server).post(`${baseURL}/create-survey`).set("authorization", jwtToken).send(payload);
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/survey url successfully created/i);
    });
  });

  /************************* Get company survey **********************************/
  describe("Get Company Survey", () => {
    it("should fail if survey is not found", async () => {
      await Survey.create({
        title: "some survey title 1",
      });

      const response = await request(server).get(`${baseURL}/get-survey/some-random-slug`);
      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/survey not found/i);
    });

    it("should fail if survey question is not found", async () => {
      const survey = await Survey.create({
        title: "some survey title 1",
        questions: [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()],
      });

      const questions = await Question.insertMany([
        {
          survey: mongoose.Types.ObjectId(),
          question: "some_question",
        },
        {
          survey: mongoose.Types.ObjectId(),
          question: "some_other_question",
        },
        {
          survey: mongoose.Types.ObjectId(),
          question: "some_last_question",
        },
      ]);

      const response = await request(server).get(`${baseURL}/get-survey/${survey.slug}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/does not exist/i);
    });

    it("should succeed if all survey requirements are met", async () => {
      const survey = await Survey.create({
        title: "some survey title 1",
      });

      const response = await request(server).get(`${baseURL}/get-survey/${survey.slug}`);
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/survey successfully retrieved/i);
    });
  });

  /************************* Response To Company's Survey **********************************/
  describe("Response To Company Survey", () => {
    it("should fail if question is missing", async () => {
      const payload = [
        {
          answer: "some_valid_answer",
        },
      ];

      const response = await request(server).post(`${baseURL}/response`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/question/i);
      expect(response.body.message).toMatch(/required/i);
    });

    it("should fail if answer is missing", async () => {
      const payload = [
        {
          question: mongoose.Types.ObjectId(),
        },
      ];

      const response = await request(server).post(`${baseURL}/response`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/answer/i);
      expect(response.body.message).toMatch(/required/i);
    });

    it("should successfully create a response if all requirements are met", async () => {
      const payload = [
        {
          question: mongoose.Types.ObjectId(),
          answer: "some_valid_answer",
        },
        {
          question: mongoose.Types.ObjectId(),
          answer: "some_other_valid_answer",
        },
        {
          question: mongoose.Types.ObjectId(),
          answer: "some_final_alid_answer",
        },
      ];

      const response = await request(server).post(`${baseURL}/response`).send(payload);
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/response successful/i);
    });
  });

  /************************* Get Survey Responses **********************************/
  describe("Get Survey Responses", () => {
    it("should fail if company does not exist", async () => {
      const jwtToken = new Company({ _id: mongoose.Types.ObjectId(), email: "some_email@gmail.com" }).generateJsonWebToken();

      await Company.insertMany([
        {
          name: "some_name",
          email: "some_other_email@gmail.com",
          address: "some_adress",
          state: "some_state",
          city: "some_city",
          password: await bcrypt.hash("some_password", 10),
        },
      ]);

      const response = await request(server).get(`${baseURL}/get-responses`).set("authorization", jwtToken);
      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/company/i);
      expect(response.body.message).toMatch(/not be found/i);
    });

    it("should fail if survey cannot be found", async () => {
      const jwtToken = new Company({ _id: mongoose.Types.ObjectId(), email: "some_email@gmail.com" }).generateJsonWebToken();
      const decode = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);

      await Company.insertMany([
        {
          _id: decode._id,
          name: "some_name",
          email: "some_other_email@gmail.com",
          address: "some_adress",
          state: "some_state",
          city: "some_city",
          password: await bcrypt.hash("some_password", 10),
        },
      ]);

      await Survey.insertMany([
        {
          title: "some valid survey title",
          company: mongoose.Types.ObjectId(),
        },
      ]);

      const response = await request(server).get(`${baseURL}/get-responses`).set("authorization", jwtToken);
      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/survey/i);
      expect(response.body.message).toMatch(/not be found/i);
    });

    it("should successfully retrive survey questions and responses if all requirements are met", async () => {
      const jwtToken = new Company({ _id: mongoose.Types.ObjectId(), email: "some_email@gmail.com" }).generateJsonWebToken();
      const decode = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);

      const theCompanies = await Company.insertMany([
        {
          _id: decode._id,
          name: "some_name",
          email: "some_other_email@gmail.com",
          address: "some_adress",
          state: "some_state",
          city: "some_city",
          password: await bcrypt.hash("some_password", 10),
        },
      ]);

      const theSurvey = await Survey.create({
        title: "some valid survey title",
        company: theCompanies[0]._id,
        questions: [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()],
      });

      const theQuestions = await Question.insertMany([
        {
          survey: theSurvey._id,
          question: theSurvey.questions[0],
        },
        {
          survey: theSurvey._id,
          question: theSurvey.questions[1],
        },
      ]);

      await Answer.insertMany([
        {
          question: theQuestions[0].question,
          answer: "some_valid_answer",
        },
        {
          question: theQuestions[1].question,
          answer: "some_other_valid_ansswer",
        },
      ]);

      const response = await request(server).get(`${baseURL}/get-responses`).set("authorization", jwtToken);
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/successfully retrieved/i);
    });
  });
});
