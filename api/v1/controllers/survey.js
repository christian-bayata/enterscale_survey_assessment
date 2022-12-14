require("express-async-errors");
const Response = require("../../../utils/response");
const status = require("../../../status-codes");
const surveyRepository = require("../../../repositories/survey");
const answerRepository = require("../../../repositories/answer");
const questionRepository = require("../../../repositories/question");
const companyRespository = require("../../../repositories/company");
const rabbitMqService = require("../../../services/rabbitmq/service");

/**
 * @Responsibility: Creates company survey
 * @Param req
 * @Param res
 * @Returns Returns the survey url
 *
 */

const createCompanySurvey = async (req, res) => {
  const { company } = res;
  const { title } = req.body;

  if (!company) return Response.sendError({ res, statusCode: status.UNAUTHENTICATED, message: "Unauthenticated. Please login" });
  if (!title) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Please provide the title of the survey" });

  try {
    const companySurvey = await surveyRepository.createSurvey({ title, company: company._id });
    const surveyUrl = `http://localhost:8000/api/survey/get-survey/${companySurvey.slug}`;

    /************** Send question to rabbitMQ queue ******************/
    // await rabbitMqService.publishToQueue("QUESTION", { companySurvey });

    return Response.sendSuccess({ res, statusCode: status.OK, message: "Survey url successfully created", body: surveyUrl });
  } catch (error) {
    // console.log(error);
    return Response.sendFatalError({ res });
  }
};

/**
 * @Responsibility: Retrieves company survey with all the questions
 * @Param req
 * @Param res
 * @Returns Returns the entire survey
 *
 */

const getCompanySurvey = async (req, res) => {
  const { slug } = req.params;

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

/**
 * @Responsibility: Respond to company survey questions
 * @Param req
 * @Param res
 * @Returns Returns all the answers provided by a user
 *
 */

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
    // console.log(error);
    return Response.sendFatalError({ res });
  }
};

/**
 * @Responsibility: Respond to company survey questions
 * @Param req
 * @Param res
 * @Returns Returns all the questions and answers provided by a user
 *
 */

const getSurveyResponses = async (req, res) => {
  const { company } = res;
  if (!company) return Response.sendError({ res, statusCode: status.UNAUTHENTICATED, message: "Unauthenticated. Please login" });

  try {
    const getCompany = await companyRespository.findCompany({ _id: company._id });
    if (!getCompany) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "Company could not be found" });

    const theSurvey = await surveyRepository.retrieveSurvey({ company: company._id });
    if (!theSurvey) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "Survey could not be found" });
    const surveyQuestions = theSurvey.questions;

    const theQuestionsAndResponses = [];
    for (let i = 0; i < surveyQuestions.length; i++) {
      const getQuestion = await questionRepository.findQuestion(surveyQuestions[i]);
      const getResponse = await answerRepository.findAnswer(surveyQuestions[i]);
      theQuestionsAndResponses.push({ question: getQuestion, response: getResponse });
    }

    const overallSurveyWithResponses = { name: getCompany.name, title: theSurvey.title, theQuestionsAndResponses };

    return Response.sendSuccess({ res, statusCode: status.OK, message: "Survey responses successfully retrieved", body: overallSurveyWithResponses });
  } catch (error) {
    // console.log(error);
    return Response.sendFatalError({ res });
  }
};

module.exports = {
  createCompanySurvey,
  respondToCompanySurvey,
  getCompanySurvey,
  getSurveyResponses,
};
