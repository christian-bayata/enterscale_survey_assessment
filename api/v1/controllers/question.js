require("express-async-errors");
const Response = require("../../../utils/response");
const status = require("../../../status-codes");
const questionRepository = require("../../../repositories/question");

const createSurveyQuestion = async (req, res) => {
  const { company } = res;
  const { question, survey } = req.body;

  if (!question) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Please provide the question" });

  try {
    const theQustion = await questionRepository.createQuestion({});
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

module.exports = {
  createSurveyQuestion,
};
