const Answer = require("../models/answer");

/**
 *
 * @param data
 * @returns {Promise<*>}
 */

const createAnswer = async (data) => {
  return await Answer.create(data);
};

module.exports = {
  createAnswer,
};
