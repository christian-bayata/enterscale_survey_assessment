require("express-async-errors");
const Response = require("../../../utils/response");
const status = require("../../../status-codes");
const surveyRepository = require("../../../repositories/survey");
const answerRepository = require("../../../repositories/answer");
const questionRepository = require("../../../repositories/question");
const rabbitMqService = require("../../../services/rabbitmq/service");

const createCompanySurvey = async (req, res) => {
  const { company } = res;
  const { title } = req.body;

  if (!company) return Response.sendError({ res, statusCode: status.UNAUTHENTICATED, message: "Uauthenticated user. Please login" });
  if (!title) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Please provide the title of the survey" });

  try {
    const companySurvey = await surveyRepository.createSurvey({ title, company: company.id });
    const surveyUrl = `http://localhost:8000/api/v1/get-survey/${companySurvey.slug}`;

    /************** Send question to rabbitMQ queue ******************/
    await rabbitMqService.publishToQueue("QUESTION", { companySurvey });

    return Response.sendSuccess({ res, statusCode: status.OK, message: "Survey url successfully created", body: surveyUrl });
  } catch (error) {
    // console.log(error);
    return Response.sendFatalError({ res });
  }
};

const getCompanySurvey = async (req, res) => {
  const { slug } = req.params;
  if (!slug) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "Slug not found" });

  try {
    const theSurvey = await surveyRepository.retrieveSurvey({ slug });
    if (!theSurvey) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "Survey not found" });
    let surveyQuestions = theSurvey.questions;
    let overallSurvey = { _id: theSurvey._id, title: theSurvey.title, slug: theSurvey.slug };

    const modifiedSurveyQuestions = [];
    for (let i = 0; i < surveyQuestions.length; i++) {
      const aQuestion = await questionRepository.findQuestion(surveyQuestions[i]._id);
      if (!aQuestion) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: `Question with id ${surveyQuestions[i]._id} does not exist.` });
      modifiedSurveyQuestions.push(aQuestion);
    }
    overallSurvey.questions = modifiedSurveyQuestions;

    return Response.sendSuccess({ res, statusCode: status.OK, message: "Survey successfully retrieved", body: overallSurvey });
  } catch (error) {
    // console.log(error);
    return Response.sendFatalError({ res });
  }
};

const respondToCompanySurvey = async (req, res) => {
  const { data } = res;
  const savedResponse = [];
  try {
    for (let i = 0; i < data.length; i++) {
      let theResponse = await answerRepository.createAnswer(data[i]);
      savedResponse.push(theResponse);
    }

    if (savedResponse.length == data.length) {
      return Response.sendSuccess({ res, statusCode: status.OK, message: "Survey response successful", body: savedResponse });
    }
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

module.exports = {
  createCompanySurvey,
  respondToCompanySurvey,
  getCompanySurvey,
};
