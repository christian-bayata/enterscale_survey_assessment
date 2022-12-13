const request = require("supertest");
const Company = require("../../models/company");
const Token = require("../../models/token");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

let server;
let baseURL = "/api/auth";

describe("Auth Controller", () => {
  beforeAll(() => {
    server = require("../../server");
  });

  afterEach(async () => {
    await Company.deleteMany({});
    await Token.deleteMany({});
  });

  afterAll(async () => {
    server.close();
    mongoose.disconnect();
  });

  /************************* Verification Code **********************************/
  describe("Verification Token", () => {
    it("should fail if the email is not provided", async () => {
      const payload = {
        email: "",
      };

      const response = await request(server).post(`${baseURL}/verification`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/provide an email/i);
    });

    it("should fail if the email provided already exists", async () => {
      await Company.insertMany([
        {
          name: "some_name",
          email: "some_email@gmail.com",
          address: "some_adress",
          state: "some_state",
          city: "some_city",
          password: await bcrypt.hash("some_password", 10),
        },
      ]);

      const payload = {
        email: "some_email@gmail.com",
      };

      const response = await request(server).post(`${baseURL}/verification`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/have an account/i);
    });

    it("should create verfication code if all requirements are met", async () => {
      const payload = { email: "some_email@gmail.com" };

      const response = await request(server).post(`${baseURL}/verification`).send(payload);
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/successfully sent/i);
    });
  });

  /************************* Sign Up **********************************/
  describe("Company Sign up", () => {
    it("should fail if the name is missing from the payload", async () => {
      const payload = {
        email: "some_email@gmail.com",
        address: "some_adress",
        state: "some_state",
        city: "some_city",
        password: await bcrypt.hash("some_password", 10),
        verCode: crypto.randomBytes(3).toString("hex").toUpperCase(),
      };

      const response = await request(server).post(`${baseURL}/signup`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/name/i);
      expect(response.body.message).toMatch(/required/i);
    });
    it("should fail if the email is missing from the payload", async () => {
      const payload = {
        name: "company_name",
        address: "some_adress",
        state: "some_state",
        city: "some_city",
        password: await bcrypt.hash("some_password", 10),
        verCode: crypto.randomBytes(3).toString("hex").toUpperCase(),
      };

      const response = await request(server).post(`${baseURL}/signup`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/email/i);
      expect(response.body.message).toMatch(/required/i);
    });
    it("should fail if the address is missing from the payload", async () => {
      const payload = {
        name: "company_name",
        email: "some_email@gmail.com",
        state: "some_state",
        city: "some_city",
        password: await bcrypt.hash("some_password", 10),
        verCode: crypto.randomBytes(3).toString("hex").toUpperCase(),
      };

      const response = await request(server).post(`${baseURL}/signup`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/address/i);
      expect(response.body.message).toMatch(/required/i);
    });
    it("should fail if the state is missing from the payload", async () => {
      const payload = {
        name: "company_name",
        email: "some_email@gmail.com",
        address: "some_adress",
        city: "some_city",
        password: await bcrypt.hash("some_password", 10),
        verCode: crypto.randomBytes(3).toString("hex").toUpperCase(),
      };

      const response = await request(server).post(`${baseURL}/signup`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/state/i);
      expect(response.body.message).toMatch(/required/i);
    });
    it("should fail if the city is missing from the payload", async () => {
      const payload = {
        name: "company_name",
        email: "some_email@gmail.com",
        address: "some_adress",
        state: "some_state",
        password: await bcrypt.hash("some_password", 10),
        verCode: crypto.randomBytes(3).toString("hex").toUpperCase(),
      };

      const response = await request(server).post(`${baseURL}/signup`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/city/i);
      expect(response.body.message).toMatch(/required/i);
    });
    it("should fail if the password is missing from the payload", async () => {
      const payload = {
        name: "company_name",
        email: "some_email@gmail.com",
        address: "some_adress",
        state: "some_state",
        city: "some_city",
        verCode: crypto.randomBytes(3).toString("hex").toUpperCase(),
      };

      const response = await request(server).post(`${baseURL}/signup`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/password/i);
      expect(response.body.message).toMatch(/required/i);
    });

    it("should fail if the verification code is missing from the payload", async () => {
      const payload = {
        name: "company_name",
        email: "some_email@gmail.com",
        address: "some_adress",
        state: "some_state",
        city: "some_city",
        password: await bcrypt.hash("some_password", 10),
      };

      const response = await request(server).post(`${baseURL}/signup`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/vercode/i);
      expect(response.body.message).toMatch(/required/i);
    });

    it("should fail if the company already exists", async () => {
      await Company.insertMany([
        {
          name: "company_name",
          email: "some_email@gmail.com",
          address: "some_adress",
          state: "some_state",
          city: "some_city",
          password: await bcrypt.hash("some_password", 10),
        },
      ]);

      const payload = {
        name: "company_name1",
        email: "some_email@gmail.com",
        address: "some_adress1",
        state: "some_state1",
        city: "some_city1",
        password: await bcrypt.hash("some_password", 10),
        verCode: crypto.randomBytes(3).toString("hex").toUpperCase(),
      };

      const response = await request(server).post(`${baseURL}/signup`).send(payload);
      expect(response.status).toBe(409);
      expect(response.body.message).toMatch(/already exists/i);
    });

    it("should fail if verification code is invalid", async () => {
      await Token.create({
        email: "some_email@gmail.com",
        user: mongoose.Types.ObjectId(),
        token: crypto.randomBytes(3).toString("hex").toUpperCase(),
      });

      const payload = {
        name: "company_name1",
        email: "some_email@gmail.com",
        address: "some_adress1",
        state: "some_state1",
        city: "some_city1",
        password: await bcrypt.hash("some_password", 10),
        verCode: "ABCDEF",
      };

      const response = await request(server).post(`${baseURL}/signup`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/invalid verification token/i);
    });
  });

  it("should fail if verification token is past 30 minutes after reception", async () => {
    let theToken = await Token.create({
      email: "some_email@gmail.com",
      user: mongoose.Types.ObjectId(),
      token: crypto.randomBytes(3).toString("hex").toUpperCase(),
      createdAt: new Date("2022-12-12T18:41:17.837+00:00"),
    });

    const payload = {
      name: "company_name1",
      email: "some_email@gmail.com",
      address: "some_adress1",
      state: "some_state1",
      city: "some_city1",
      password: await bcrypt.hash("some_password", 10),
      verCode: theToken.token,
    };

    const response = await request(server).post(`${baseURL}/signup`).send(payload);
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/token has expired/i);
  });

  it("should sign up a company successfully if all requirements are met", async () => {
    let theToken = await Token.create({
      email: "some_email@gmail.com",
      user: mongoose.Types.ObjectId(),
      token: crypto.randomBytes(3).toString("hex").toUpperCase(),
    });

    const payload = {
      name: "company_name1",
      email: "some_email@gmail.com",
      address: "some_adress1",
      state: "some_state1",
      city: "some_city1",
      password: await bcrypt.hash("some_password", 10),
      verCode: theToken.token,
    };

    const response = await request(server).post(`${baseURL}/signup`).send(payload);
    expect(response.status).toBe(201);
    expect(response.body.message).toMatch(/successfully signed up/i);
  });

  /************************* Log in **********************************/
  describe("Login an already signed up company", () => {
    it("should fail if email is mising", async () => {
      const payload = { password: "user_password" };

      const response = await request(server).post(`${baseURL}/login`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/email/i);
      expect(response.body.message).toMatch(/required/i);
    });

    it("should fail if password is mising", async () => {
      const payload = { email: "user@gmail.com" };

      const response = await request(server).post(`${baseURL}/login`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/password/i);
      expect(response.body.message).toMatch(/required/i);
    });

    it("should fail if user is not already signed up", async () => {
      await Company.insertMany([
        {
          name: "company_name",
          email: "some_email@gmail.com",
          address: "some_adress",
          state: "some_state",
          city: "some_city",
          password: await bcrypt.hash("some_password", 10),
          verCode: crypto.randomBytes(3).toString("hex").toUpperCase(),
        },
      ]);

      const payload = { email: "user11@gmail.com", password: "user_password" };

      const response = await request(server).post(`${baseURL}/login`).send(payload);
      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/Sorry you do not have an account with us/i);
    });

    it("should fail if password does not match", async () => {
      await Company.insertMany([
        {
          name: "company_name",
          email: "some_email@gmail.com",
          address: "some_adress",
          state: "some_state",
          city: "some_city",
          password: await bcrypt.hash("some_password", 10),
          verCode: crypto.randomBytes(3).toString("hex").toUpperCase(),
        },
      ]);

      const payload = { email: "some_email@gmail.com", password: "user_password" };

      const response = await request(server).post(`${baseURL}/login`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/incorrect password/i);
    });

    it("should succeed all requirements are met", async () => {
      await Company.insertMany([
        {
          name: "company_name",
          email: "some_email@gmail.com",
          address: "some_adress",
          state: "some_state",
          city: "some_city",
          password: await bcrypt.hash("some_password", 10),
          verCode: crypto.randomBytes(3).toString("hex").toUpperCase(),
        },
      ]);

      const payload = { email: "some_email@gmail.com", password: "some_password" };

      const response = await request(server).post(`${baseURL}/login`).send(payload);
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/successfully logged in/i);
    });
  });
});
