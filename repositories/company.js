const Company = require("../models/company");

/**
 *
 * @param where
 * @returns {Promise<*>}
 */

const findCompany = async (where) => {
  return await Company.findOne(where);
};

/**
 *
 * @param data
 * @returns {Promise<*>}
 */

const createCompany = async (data) => {
  return await Company.create(data);
};

module.exports = { findCompany, createCompany };
