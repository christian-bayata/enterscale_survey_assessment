require("express-async-errors");
const Response = require("../../../utils/response");
const status = require("../../../status-codes");
const questionRepository = require("../../../repositories/question");
const rabbitMqService = require("../../../services/rabbitmq/service");

/**
 * @Responsibility: Creates company survey question(s)
 * @Param req
 * @Param res
 * @Returns Returns the new question
 *
 */

const createSurveyQuestion = async (req, res) => {
  const { company, data } = res;

  try {
    const newQuestion = await questionRepository.createQuestion({ question: data.question, survey: data.survey });
    if (newQuestion && newQuestion._id) {
      await questionRepository.addQuestions(data.survey, newQuestion._id);
    }

    /************** Send question to rabbitMQ queue ******************/
    // await rabbitMqService.publishToQueue("QUESTION", { newQuestion });

    return Response.sendSuccess({ res, statusCode: status.OK, message: "Successfully created question for survey", body: newQuestion });
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

module.exports = {
  createSurveyQuestion,
};
