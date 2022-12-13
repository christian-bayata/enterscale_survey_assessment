const { Router } = require("express");
const companyMiddleware = require("../../../middlewares/company");
const questionMiddleware = require("../../../middlewares/question");
const questionController = require("../controllers/question");

const questionRouter = Router();

questionRouter.post("/create-question", companyMiddleware.authenticateCompany, questionMiddleware.createQuestionValidation, questionController.createSurveyQuestion);

// questionRouter.post("/signup", companyMiddleware.signupValidation, authController.signUp);

// questionRouter.post("/login", companyMiddleware.loginValidation, authController.login);

module.exports = questionRouter;
