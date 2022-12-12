const models = require("../models/index");

/**
 *
 * @param where
 * @returns {Promise<*>}
 */

const findUser = async (where) => {
  //   console.log("where: ", where);
  //   return await Company.findOne({ where });
};

/**
 *
 * @param data
 * @returns {Promise<*>}
 */

const createVerToken = async (data) => {
  //   return await Token.create(data);
};

module.exports = { findUser, createVerToken };
