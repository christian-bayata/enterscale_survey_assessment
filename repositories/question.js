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

/**
 *
 * @param surveyId
 * @param questionId
 * @returns {Promise<*>}
 */
const addQuestions = async (surveyId, questionId) => {
  return await Survey.findOneAndUpdate({ _id: surveyId }, { $addToSet: { questions: questionId } }, { new: true });
};

/**
 *
 * @param id
 * @returns {Promise<*>}
 */
const findQuestion = async (id) => {
  return await Question.findOne({ _id: id }, "_id, question");
};

module.exports = {
  createQuestion,
  addQuestions,
  findQuestion,
};
