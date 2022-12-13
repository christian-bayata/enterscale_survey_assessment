const Survey = require("../models/survey");

/**
 *
 * @param data
 * @returns {Promise<*>}
 */

const createSurvey = async (data) => {
  return await Survey.create(data);
};

/**
 *
 * @param data
 * @returns {Promise<*>}
 */

const retrieveSurvey = async (where) => {
  return await Survey.findOne(where);
};

module.exports = {
  createSurvey,
  retrieveSurvey,
};
