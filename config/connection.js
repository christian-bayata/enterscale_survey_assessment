require("dotenv").config();
const environment = process.env.NODE_ENV || "development";
let connectionString;

switch (environment) {
  case "production":
    // Point the database credentials to the production DB here
    connectionString = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
    break;
  case "test":
    connectionString = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.TEST_DB_NAME}`;
    break;
  case "production":
    connectionString = `${process.env.DATABASE_URL}`;
  default:
    connectionString = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
}

module.exports = connectionString;
