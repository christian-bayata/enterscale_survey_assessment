const Question = require("../models/uestion");
/**
 *
 * @param data
 * @returns {Promise<*>}
 */

const createQuestion = async (data) => {
  return await Question.create(data);
};

module.exports = {
  createQuestion,
};
