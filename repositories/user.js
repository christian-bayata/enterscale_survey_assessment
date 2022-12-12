const Company = require("../models/company");

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

const createUser = async (data) => {
  return await Company.create(data);
};

module.exports = { findUser, createUser };
