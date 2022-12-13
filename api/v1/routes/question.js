const { Router } = require("express");
const userMiddleware = require("../../../middlewares/user");
const questionMiddleware = require("../../../middlewares/question");
const questionController = require("../controllers/question");

const questionRouter = Router();

questionRouter.post("/create-question", userMiddleware.authenticateCompany, questionMiddleware.createQuestionValidation, questionController.createSurveyQuestion);

// questionRouter.post("/signup", userMiddleware.signupValidation, authController.signUp);

// questionRouter.post("/login", userMiddleware.loginValidation, authController.login);

module.exports = questionRouter;
