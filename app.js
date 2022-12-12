//require("express-async-errors");
// require("dotenv").config();
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const morgan = require("morgan");
const winston = require("./logger/winston-setup");
//const error = require("./middlewares/error");
const swaggerDocument = require("./swagger.json");
const cors = require("cors");
//const Response = require("./utils/response");
//const router = require("./api/v1/routes/index");
const sequelize = require("./config/database");

/* Initialize express application */
const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(morgan("combined", { stream: winston.stream }));
app.use(express.json());
app.use(cors());

/* Connect to the database */
sequelize
  .authenticate()
  .then(() => {
    console.log(`DB connection established successfully in ${process.env.NODE_ENV} mode`);
  })
  .catch((err) => {
    console.log("Unable to connect to DB", err);
  });

/* Ping the API to ensure it is running. */
// app.get("/health-check", (req, res) => {
//   return Response.sendSuccess({ res, message: "Health check passed" });
// });

/* Bind app port to index router */
//app.use("/api", router);

/* Use the error handling middleware as the last in the middleware stack */
//app.use(error);

module.exports = app;
