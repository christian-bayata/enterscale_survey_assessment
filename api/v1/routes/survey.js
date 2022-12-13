const { Router } = require("express");
const userMiddleware = require("../../../middlewares/user");
const surveyMiddleware = require("../../../middlewares/survey");
const surveyController = require("../controllers/survey");

const surveyRouter = Router();

surveyRouter.post("/create-survey", userMiddleware.authenticateCompany, surveyController.createCompanySurvey);

surveyRouter.get("/get-survey/:slug", surveyController.getCompanySurvey);

surveyRouter.post("/response", surveyMiddleware.responseToQuesValidation, surveyController.respondToCompanySurvey);

module.exports = surveyRouter;
