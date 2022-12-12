require("dotenv").config();
const { Sequelize } = require("sequelize");

let sequelize;

const isTest = process.env.NODE_ENV === "test";

const dbName = isTest ? process.env.TEST_DB_NAME : process.env.DB_NAME;
const dbUser = process.env.DB_USERNAME;
const dbHost = process.env.DB_HOST;
const dbDriver = process.env.DB_DRIVER;
const dbPassword = process.env.DB_PASSWORD;
const dbPort = process.env.DB_PORT;

const URI = `${dbDriver}://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

sequelize = new Sequelize(URI, {
  //   host: "mysql2",
  dialect: "mysql",
});

module.exports = sequelize;
