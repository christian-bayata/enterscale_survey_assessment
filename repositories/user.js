const Company = require("../models/company");
const Token = require("../models/token");

/**
 *
 * @param email
 * @returns {Promise<*>}
 */

const findUser = async (email) => {
  return await Company.findOne({ email });
};

/**
 *
 * @param data
 * @returns {Promise<*>}
 */

const createVerToken = async (data) => {
  return await Token.create(data);
};

module.exports = { findUser, createVerToken };
