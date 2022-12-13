const Answer = require("../models/answer");

/**
 *
 * @param data
 * @returns {Promise<*>}
 */

const createAnswer = async (data) => {
  return await Answer.create(data);
};

/**
 *
 * @param data
 * @returns {Promise<*>}
 */

const findAnswer = async (id) => {
  return await Answer.findOne({ question: id }, "_id, answer");
};

module.exports = {
  createAnswer,
  findAnswer,
};
