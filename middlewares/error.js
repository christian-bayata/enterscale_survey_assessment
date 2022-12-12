const winston = require("winston");
const ErrorHandler = require("../utils/error-handler");

module.exports = (error, req, res, next) => {
  res.locals.message = error.message;
  res.locals.error = process.env.NODE_ENV === "development" ? error : {};
  winston.error(`${error.status || 500} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  return ErrorHandler.handle(error, req, res, next);
};
