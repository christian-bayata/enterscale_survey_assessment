require("dotenv").config();
const appRoot = require("app-root-path");
const winston = require("winston");

const options = {
  file: {
    level: "info",
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  database: {
    db: process.env.DB_FOR_LOGS,
    level: process.env.NODE_ENV === "development" ? "debug" : "info",
  },
  //   mail: {
  //     level: "error",
  //     to: process.env.APP_EMAIL,
  //     from: process.env.APP_EMAIL,
  //     subject: "An Error Occurred On Server. Please Check IT ASAP",
  //     host: process.env.EMAIL_HOST,
  //     username: process.env.APP_EMAIL,
  //     password: process.env.APP_EMAIL_PASSWORD,
  //   },
  console: {
    level: "debug",
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

const logger = winston.createLogger({
  transports: [new winston.transports.File(options.file), new winston.transports.Console(options.console), new winston.transports.Console(options.mail)],
  exitOnError: false, // do not exit on handled exceptions
});

logger.stream = {
  write: function (message) {
    logger.info(message);
  },
};

module.exports = logger;
