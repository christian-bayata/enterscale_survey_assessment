require("express-async-errors");
const Response = require("../../../utils/response");
const status = require("../../../status-codes");
const questionRepository = require("../../../repositories/question");
const rabbitMqService = require("../../../services/rabbitmq/service");

const createSurveyQuestion = async (req, res) => {
  const { company, data } = res;
  if (!company) return Response.sendError({ res, statusCode: status.UNAUTHENTICATED, message: "Uauthenticated user. Please login" });

  try {
    const newQuestion = await questionRepository.createQuestion({ question: data.question, survey: data.survey });
    if (newQuestion && newQuestion._id) {
      await questionRepository.addQuestions(data.survey, newQuestion._id);
    } else {
      return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Error! Could not create question" });
    }

    /************** Send question to rabbitMQ queue ******************/
    await rabbitMqService.publishToQueue("QUESTION", { newQuestion });

    return Response.sendSuccess({ res, statusCode: status.OK, message: "Successfully created question for survey", body: newQuestion });
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

module.exports = {
  createSurveyQuestion,
};
