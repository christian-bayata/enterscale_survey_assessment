const Question = require("../models/question");
const Survey = require("../models/survey");

/**
 *
 * @param data
 * @returns {Promise<*>}
 */

const createQuestion = async (data) => {
  return await Question.create(data);
};

const addQuestions = async (surveyId, questionId) => {
  return await Survey.findOneAndUpdate({ _id: surveyId }, { $addToSet: { questions: questionId } }, { new: true });
};

module.exports = {
  createQuestion,
  addQuestions,
};
