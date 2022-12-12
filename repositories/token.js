const Token = require("../models/token");

/**
 *
 * @param data
 * @returns {Promise<*>}
 */

const createVerToken = async (data) => {
  return await Token.create(data);
};

/**
 *
 * @param where
 * @returns {Promise<*>}
 */

const confirmVerToken = async (where) => {
  return await Token.findOne(where);
};

/**
 *
 * @param data
 * @returns {Promise<void>}
 */
const deleteVerToken = async (data) => {
  return await Token.deleteOne(data);
};

module.exports = { createVerToken, confirmVerToken, deleteVerToken };
