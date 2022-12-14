# enterscale_survey_assessment

> A secured survey server that allows a company admin to roll out surveys. The API was built with Node JS, MongoDB, mongoose ODM

| PROJECT FEATURE                                             |       STATUS       |
| :---------------------------------------------------------- | :----------------: |
| Sign Up                                                     | :white_check_mark: |
| Login                                                       | :white_check_mark: |
| Password Reset                                              | :white_check_mark: |
| Company Create Survey(s)                                    | :white_check_mark: |
| End User(s) Retrieves Survey                                | :white_check_mark: |
| End User(s) Respond To Survey                               | :white_check_mark: |
| Company Retrieve All Questions And Responses By An End-User | :white_check_mark: |
| Test Driven Development                                     | :white_check_mark: |
| Test Coverage Reporting                                     | :white_check_mark: |
| Micro service Architecture                                  | :white_check_mark: |
| Background Services in RabbitMQ                             | :white_check_mark: |

- :cop: Authentication via [JWT](https://jwt.io/)
- Routes mapping via [express-router](https://expressjs.com/en/guide/routing.html)
- Documented using [Swagger](https://swagger.io). Find link to docs [here](http://206.189.227.235/api-docs)
- Background operations are run on [enterscale-survey-background-service](https://github.com/christian-bayata/enterscale_survey_assessment). This is a public repo and is easily accessible.
- Uses [MongoDB](https://www.mongodb.com) as database. The reason for this is: speed and non-complex setup for unit, integrated and end-to-end testing
- [Mongoose](https://mongoosejs.com) as object document model
- Environments for `development`, `test`, and `production`
- Unit and Integration tests running with [Jest](https://github.com/facebook/jest)
- Built with [yarn scripts](#npm-scripts)
- example for Company model and Company controller, with jwt authentication, simply type `yarn start`

## Table of Contents

- [Install & Use](#install-and-use)
- [Folder Structure](#folder-structure)
- [Repositories](#repositories)
  - [Create a Repository](#create-a-repository)
- [Controllers](#controllers)
  - [Create a Controller](#create-a-controller)
- [Models](#models)
  - [Create a Model](#create-a-model)
- [Middlewares](#middlewares)
- [Services](#services)
- [Config](#config)
  - [Connection and Database](#connection-and-database)
- [Routes](#routes)
  - [Create Routes](#create-routes)
- [Test](#test)
  - [Setup](#setup)
  - [Controllers](#controllers)
  - [Models](#models)
- [yarn-scripts](#yarn-scripts)

## Install and Use

Start by cloning this repository

```sh
# HTTPS
$ git clone https://github.com/christian-bayata/enterscale_survey_assessment
```

then

```sh
# cd into project root
$ yarn
$ yarn start
```

## Folder Structure

This codebase has the following directories:

- api - a folder that contains controllers and routes sub-folders.
- config - settings for mongoDB database and mongoose connection.
- logger - winston setup for logs.
- logs - output of API logs(winston) are found here.
- middlewares - all middleware functions for company, error, question and survey.
- models - database schema definitions, plugins and model creation
- repositories - wrappers for database functions (Similar to DAO)
- services - folder containing external service(s)
- tests - automated tests for the project
- utils - Functions used often in codebase and tests

## Repositories

### Create a repository

Repositories are wrappers around the models and use dependency injection to take the model as input
I used [Mongoose](https://mongoosejs.com) as ODM, if you want further information read the [Docs](https://mongoosejs.com/docs/guide.html).
Example Controller for all **CRUD** operations (taking the company respository as an example):

```js
const Company = require("../models/company");

/**
 *
 * @param where
 * @returns {Promise<*>}
 */

const findCompany = async (where) => {
  return await Company.findOne(where);
};

/**
 *
 * @param data
 * @returns {Promise<*>}
 */

const createCompany = async (data) => {
  return await Company.create(data);
};

module.exports = { findCompany, createCompany };
```

## Controllers

### Create a Controller

Controllers in the codebase have a naming convention: `modelname.js` (except for **auth** which shares the same model with **company**).
To use a model function inside the controller, require the repository in the controller and use it. The controller should not have direct access to the model except through the repository

Example Controller for all **CRUD** operations (taking the auth controller as an example):

```js
require("express-async-errors");
const companyRespository = require("../../../repositories/company");
const tokenRepository = require("../../../repositories/token");
const Response = require("../../../utils/response");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const sendEmail = require("../../../utils/send_email");
const status = require("../../../status-codes");
const _ = require("lodash");
const mongoose = require("mongoose");
const helper = require("../../../utils/helper");

/**
 * @Responsibility: Company verification code
 * @Param req
 * @Param res
 * @Returns Returns the verification code of the company
 *
 */
const verificationCode = async (req, res) => {
  const { email } = req.body;
  if (!email) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Please provide an email" });

  try {
    /* Check if user with this email already exists */
    const confirmEmail = await companyRespository.findCompany({ email });
    if (confirmEmail) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "You already have an account with us" });

    /* Create verification code for user */
    const verToken = { email, token: crypto.randomBytes(3).toString("hex").toUpperCase() };
    const userToken = await tokenRepository.createVerToken(verToken);

    /* Send verification code to company's email address */
    const message = `Hello, your verification token is ${userToken.token}.\n\n Thanks and regards`;
    await sendEmail({ email, subject: "Verification token", message });

    return Response.sendSuccess({ res, statusCode: status.OK, message: "Token successfully sent", body: userToken });
  } catch (error) {
    // console.log("********************: ", error);
    return Response.sendFatalError({ res });
  }
};

/**
 * @Responsibility:  Company signs up
 * @param req
 * @param res
 * @returns {Promise<*>}
 */

const signUp = async (req, res) => {
  const { data } = res;

  /*  Start mongoose transaction */
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    /* Check if user already exists */
    const company = await companyRespository.findCompany({ email: data.email });
    if (company) return Response.sendError({ res, statusCode: status.CONFLICT, message: "Company already exists" });

    const confirmUserVerCode = await tokenRepository.confirmVerToken({ email: data.email, token: data.verCode });
    if (!confirmUserVerCode) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Invalid verification token, please try again." });

    /* Delete token if the received time is past 30 minutes */
    const timeDiff = +(Date.now() - confirmUserVerCode.createdAt.getTime());
    const timeDiffInMins = +(timeDiff / (1000 * 60));
    if (timeDiffInMins > 30) {
      await tokenRepository.deleteVerToken({ email: data.email, token: data.verCode });
      return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "The verification token has expired, kindly request another." });
    }

    const companyData = { name: data.name, email: data.email, address: data.address, state: data.state, password: data.password, city: data.city };
    const createCompany = await companyRespository.createCompany(companyData, { session });
    const theCompany = _.pick(createCompany, ["_id", "name", "address", "email", "state", "city"]);
    await tokenRepository.deleteVerToken({ email: data.email, token: data.verCode }, { session });
    /* Commit the changes made */
    await session.commitTransaction();

    return Response.sendSuccess({ res, statusCode: status.CREATED, message: "Company successfully signed up", body: theCompany });
  } catch (error) {
    // console.log(error);
    return Response.sendFatalError({ res });
  } finally {
    /* Ending the session */
    session.endSession();
  }
};

/**
 * @Responsibility:  Logs in an already signed up company
 * @param req
 * @param res
 * @returns {Promise<*>}
 */

const login = async (req, res) => {
  const { data } = res;

  try {
    const company = await companyRespository.findCompany({ email: data.email });
    if (!company) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "Sorry you do not have an account with us. Please sign up" });

    /* validate user password with bcrypt */
    const validPassword = await company.comparePassword(data.password);
    if (!validPassword) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Incorrect Password! Unauthorized" });

    /* Generate JWT token for user */
    const token = company.generateJsonWebToken();

    /* Format and hash user data for security */
    const protectedData = helper.formatCompanyData(data);

    return Response.sendSuccess({ res, statusCode: status.OK, message: "User successfully logged in", body: { token, userData: protectedData } });
  } catch (error) {
    // console.log(error);
    return Response.sendFatalError({ res });
  }
};

/**
 * @Responsibility: Provide company with password reset token
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Please provide a valid email" });

  try {
    const company = await companyRespository.findCompany({ email });
    if (!company) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "Sorry you do not have an account with us. Please sign up" });

    //Create reset password token and save
    const getResetToken = await helper.resetToken(company);

    const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${getResetToken}`;

    //Set the password reset email message for company
    const message = `This is your password reset token: \n\n${resetUrl}\n\nIf you have not requested this email, then ignore it`;

    //The reset token email
    await sendEmail({ email: company.email, subject: "Password Recovery", message });

    return Response.sendSuccess({ res, statusCode: status.OK, message: "Password reset token successfully sent" });
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

/**
 * @Responsibility: Enables user reset password with reset token
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */

const resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.params;

  try {
    const company = await companyRespository.findCompany({ resetPasswordToken: token });
    if (!company) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Password reset token is invalid" });

    // Check to see if the token is still valid
    const timeDiff = +(Date.now() - company.resetPasswordDate.getTime());
    const timeDiffInMins = +(timeDiff / (1000 * 60));

    if (timeDiffInMins > 30) {
      company.resetPasswordToken = undefined;
      company.resetPasswordDate = undefined;
      await company.save();

      return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Password reset token has expired" });
    }

    // Confirm if the password matches
    if (password !== confirmPassword) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Password does not match" });

    // If password matches
    company.password = password;

    company.resetPasswordToken = undefined;
    company.resetPasswordDate = undefined;
    await company.save();

    // Generate another Auth token for company
    const authToken = company.generateJsonWebToken();

    /* Format and hash company data for security */
    const protectedData = helper.formatCompanyData(company);

    return Response.sendSuccess({ res, statusCode: status.OK, message: "Password reset is successful", body: { token: authToken, companyData: protectedData } });
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

module.exports = { verificationCode, signUp, login, forgotPassword, resetPassword };
```

## Models

### Create a Model

Models in this boilerplate have a naming convention: `modelname.js` and uses [Mongoose](https://mongoosejs.com) to define our Models, if you want further information read the [Docs](https://mongoosejs.com/docs/guide.html).

Example - Let's see an aexample of a model using the **company** Model as a case study:

```js
require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const CompanySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    resetPasswordToken: String,
    resetPasswordDate: Date,
  },
  { timestamps: true }
);

/* Generate JSON web token for company */
CompanySchema.methods.generateJsonWebToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.JWT_SECRET_KEY
  );
};

/* Hash the password before storing it in the database */
CompanySchema.pre("save", async function save(next) {
  try {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
  } catch (err) {
    return next(err);
  }
});

/* Compare password using bcrypt.compare */
CompanySchema.methods.comparePassword = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

/* Creates the company model */
const Company = mongoose.model("Company", CompanySchema);
module.exports = Company;
```

## Middlewares

Middleware are functions that can run before hitting a route.

Example middleware:

Authenticate User - only allow if the user is logged in

> Note: this is not a secure example, only for presentation purposes

```js
/**
 * @Responsibility:  Middleware authentication for company
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */

const authenticateCompany = async (req, res, next) => {
  let { authorization } = req.headers;
  const { userId } = req.body;

  if (!authorization) {
    authorization = req.body.authorization;
  }

  /* decode jwt token from req header */
  const decode = jwt.verify(authorization, process.env.JWT_SECRET_KEY, (err, decoded) => decoded);

  /* if token is invalid or has expired */
  if (!authorization || !decode || !decode._id) {
    return Response.sendError({ res, statusCode: status.UNAUTHENTICATED, message: "You are unauthenticated! Please login" });
  }

  try {
    res.company = decode;
    return next();
  } catch (error) {
    // console.log(error);
    return Response.sendFatalError({ res });
  }
};
```

Joi input validations are also designed to be injecetd into the codebase as middlewares, so that before the route can run we can ensure that the client has supplied valid inputs that can be stored in the database.
For instanec, take a look at the input validation for signing up as a company.

```js
/**
 * @Responsibility: Validation middleware for company sign up
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */

const signupValidation = async (req, res, next) => {
  const payload = req.body;

  try {
    const schema = Joi.object({
      name: Joi.string().min(10).max(100).required(),
      address: Joi.string().max(100).required(),
      state: Joi.string().max(50).required(),
      city: Joi.string().max(50).required(),
      verCode: Joi.string().max(6).required(),
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .lowercase()
        .required(),
      password: Joi.string().min(6).required(),
    });

    const { error, value } = schema.validate(payload);

    if (error) {
      return Response.sendError({ res, message: error.details[0].message });
    }

    res.data = value;
    return next();
  } catch (error) {
    return error;
  }
};
```

It is passed into the `auth` route as a middleware before the route is hit.
Check it out below:

```js
const { Router } = require("express");
const companyMiddleware = require("../../../middlewares/company");
const authController = require("../controllers/auth");

authRouter.post("/signup", companyMiddleware.signupValidation, authController.signUp);
```

## Connection and Database

> Note: if you use MongoDB make sure mongodb server is running on the machine
> This two files are the ways to establish a connection to a database.
> Now simply configure the keys with your credentials from environment variables

```js
require("dotenv").config();
const environment = process.env.NODE_ENV || "development";
let connectionString;

switch (environment) {
  case "test":
    connectionString = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.TEST_DB_NAME}`;
    break;
  case "production":
    connectionString = `${process.env.DATABASE_URL}`;
    break;
  default:
    connectionString = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
}

module.exports = connectionString;
```

The connection string is passed into the Mongo DB connect method, and depends on the environment variable that is currently in use from the yarn script.

```js
const mongoose = require("mongoose");

class Database {
  constructor(connectionString) {
    this.connectionString = connectionString;
  }

  async connect() {
    try {
      mongoose.set("strictQuery", false);
      const connection = await mongoose.connect(this.connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to the database successfully");
      return connection;
    } catch (error) {
      console.log("Could not connect to the database", error);
      return error;
    }
  }
}

module.exports = Database;
```

To not configure the production code.

To start the DB, add the credentials for production. add `environment variables` by typing e.g. `export DB_USER=yourusername` before starting the api or just include credentials in the env file

## Routes

Here you define all your routes for your api.

### Create Routes

For further information read the [guide](https://expressjs.com/en/guide/routing.html) of express router.

Example for User Resource:

> Note: Only supported Methods are **POST**, **GET**, **PUT**, and **DELETE**.

auth.js

```js
const { Router } = require("express");
const companyMiddleware = require("../../../middlewares/company");
const authController = require("../controllers/auth");

const authRouter = Router();

authRouter.post("/verification", authController.verificationCode);

authRouter.post("/signup", companyMiddleware.signupValidation, authController.signUp);

authRouter.post("/login", companyMiddleware.loginValidation, authController.login);

authRouter.post("/forgot-password", authController.forgotPassword);

authRouter.patch("/reset-password/:token", authController.resetPassword);

module.exports = authRouter;
```

Although individually placed, all routes are eventually combined into one mother-route called 'index.js'.
index.js

```js
const { Router } = require("express");
const authRouter = require("./auth");
const surveyRouter = require("./survey");
const questionRouter = require("./question");

const router = Router();

router.use("/auth", authRouter);
router.use("/survey", surveyRouter);
router.use("/question", questionRouter);

module.exports = router;
```

The index route is then exported and required in app.js file

```js
const router = require("./api/v1/routes/index");

/* Initialize express application */
const app = express();

/* Bind app port to index router */
app.use("/api", router);
```

## Test

All test for this boilerplate uses [Jest](https://github.com/facebook/jest) and [supertest](https://github.com/visionmedia/superagent) for integration testing. So please read their docs on further information.

### Setup

To set up this project for jest test, I wrote the `jest.config.js` file which holds all the configurations of the test.

```js
module.exports = {
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/"],
  transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs)$"],
  transform: {
    "^.+\\.(js|jsx)?$": "<rootDir>/node_modules/babel-jest",
  },
};
```

### Controller

> Note: those request are asynchronous, we use `async await` syntax.

> All controller actions are wrapped in a function to avoid repetitive try...catch syntax

To test a Controller we create `requests` to our api routes.

The tests focuses only on `integration` and not `unit` for this project;

Example of integration test for `auth`:

```js
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

  /************************* Verification Token **********************************/
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

  /************************* Forgot Password **********************************/
  describe("Forgot Password", () => {
    it("should fail if email is mising", async () => {
      const payload = { email: "" };

      const response = await request(server).post(`${baseURL}/forgot-password`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/provide a valid email/i);
    });

    it("should fail if the email is wrong", async () => {
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

      const payload = { email: "user11@gmail.com" };

      const response = await request(server).post(`${baseURL}/forgot-password`).send(payload);
      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/sorry/i);
      expect(response.body.message).toMatch(/please sign up/i);
    });

    it("should succeed if the email is right", async () => {
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

      const payload = { email: "some_email@gmail.com" };

      const response = await request(server).post(`${baseURL}/forgot-password`).send(payload);
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/token successfully sent/i);
    });
  });

  /************************* Reset User Password **********************************/
  describe("Reset User Password", () => {
    it("should fail if reset token cannot be found", async () => {
      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

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

      const payload = {
        password: "user_password",
        confirmPassword: "user_password",
      };

      const response = await request(server).patch(`${baseURL}/reset-password/${resetPasswordToken}`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Password reset token is invalid/i);
    });

    it("should fail if the token has expired", async () => {
      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

      await Company.create({
        name: "company_name",
        email: "some_email@gmail.com",
        address: "some_adress",
        state: "some_state",
        city: "some_city",
        password: await bcrypt.hash("some_password", 10),
        verCode: crypto.randomBytes(3).toString("hex").toUpperCase(),
        resetPasswordToken,
        resetPasswordDate: new Date("2022-11-09T10:08:06.050+00:00"),
      });

      const payload = {
        password: "user_password",
        confirmPassword: "user_password",
      };

      const response = await request(server).patch(`${baseURL}/reset-password/${resetPasswordToken}`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Password reset token has expired/i);
    });

    it("should fail if password does not match", async () => {
      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

      await Company.create({
        name: "company_name",
        email: "some_email@gmail.com",
        address: "some_adress",
        state: "some_state",
        city: "some_city",
        password: await bcrypt.hash("some_password", 10),
        verCode: crypto.randomBytes(3).toString("hex").toUpperCase(),
        resetPasswordToken,
        resetPasswordDate: new Date(),
      });

      const payload = {
        password: "user_password1",
        confirmPassword: "user_password12",
      };

      const response = await request(server).patch(`${baseURL}/reset-password/${resetPasswordToken}`).send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Password does not match/i);
    });

    it("should succeed if password matches", async () => {
      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

      await Company.create({
        name: "company_name",
        email: "some_email@gmail.com",
        address: "some_adress",
        state: "some_state",
        city: "some_city",
        password: await bcrypt.hash("some_password", 10),
        verCode: crypto.randomBytes(3).toString("hex").toUpperCase(),
        resetPasswordToken,
        resetPasswordDate: Date.now(),
      });

      const payload = {
        password: "user_password12",
        confirmPassword: "user_password12",
      };

      const response = await request(server).patch(`${baseURL}/reset-password/${resetPasswordToken}`).send(payload);
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/Password reset is successful/i);
    });
  });
});
```

### Models

Models are usually automatically tested in the integration tests as the Controller uses the Models, but you can test them seperately.

- Pictorial view of the test coverage of the project

<img width="1679" alt="Screenshot 2022-12-14 at 05 03 53" src="https://user-images.githubusercontent.com/80787295/207563968-da8b76e5-b9e6-4d79-ae99-b827e8e3e169.png">

## yarn scripts

There are no automation tools or task runner like [grunt](https://gruntjs.com/) or [gulp](http://gulpjs.com/) used for this project. This project only uses yarn scripts for automation.

### yarn start

This is the entry for a developer. This command:

- runs **nodemon watch task** for the all files connected to the codebase
- sets the **environment variable** `NODE_ENV` to `development`
- opens the db connection for `development`
- starts the server on `localhost`

### yarn test

This command:

- sets the **environment variable** `NODE_ENV` to `test`
- creates the `test database`
- runs `jest --runInBand --coverage --verbose --forceExit` for testing with [Jest](https://github.com/facebook/jest) and the coverage
- drops the `test database` after the test

## yarn run production

This command:

- sets the **environment variable** to `production`
- opens the db connection for `production`
- starts the server on 127.0.0.1 or on 127.0.0.1:PORT_ENV

Before running on any environment you have to set the **environment variables**:

```dotenv
NODE_ENV=
DB_HOST=
DB_PORT=
DB_NAME=
TEST_DB_NAME=
JWT_SECRET_KEY=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_NAME=
SMTP_FROM_EMAIL=
SMTP_HOST=
SMTP_PORT=
RABBITMQ_USERNAME=
RABBITMQ_PASSWORD=
RABBITMQ_PORT=
RABBITMQ_HOST=
```

## LICENSE

MIT © Enterscale Survey Assessment
