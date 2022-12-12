const Survey = require("../models/survey");
/**
 *
 * @param data
 * @returns {Promise<*>}
 */

const createSurvey = async (data) => {
  return await Survey.create(data);
};

module.exports = {
  createSurvey,
};
