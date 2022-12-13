const { Router } = require("express");
const companyMiddleware = require("../../../middlewares/company");
const surveyMiddleware = require("../../../middlewares/survey");
const surveyController = require("../controllers/survey");

const surveyRouter = Router();

surveyRouter.post("/create-survey", companyMiddleware.authenticateCompany, surveyController.createCompanySurvey);

surveyRouter.get("/get-survey/:slug", surveyController.getCompanySurvey);

surveyRouter.post("/response", surveyMiddleware.responseToQuesValidation, surveyController.respondToCompanySurvey);

surveyRouter.get("/get-responses", companyMiddleware.authenticateCompany, surveyController.getSurveyResponses);

module.exports = surveyRouter;
