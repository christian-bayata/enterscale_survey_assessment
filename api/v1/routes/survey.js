const { Router } = require("express");
const userMiddleware = require("../../../middlewares/user");
const surveyController = require("../controllers/survey");

const surveyRouter = Router();

surveyRouter.post("/create-survey", userMiddleware.authenticateCompany, surveyController.createCompanySurvey);

// surveyRouter.post("/signup", userMiddleware.signupValidation, authController.signUp);

// surveyRouter.post("/login", userMiddleware.loginValidation, authController.login);

module.exports = surveyRouter;
