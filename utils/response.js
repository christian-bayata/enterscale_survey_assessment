const status = require("../status-codes");

class Response {
  /**
   *
   * @param param0
   * @returns {*}
   */
  static sendSuccess({ res, statusCode = status.OK, message = "Successful Operation", body = {} }) {
    return res.status(statusCode).send({ message, body });
  }

  /**
   *
   * @param param0
   * @returns {*}
   */
  static sendError({ res, statusCode = status.BAD_REQUEST, message = "Failed Operation", body = {} }) {
    return res.status(statusCode).send({ message, body });
  }

  /**
   *
   * @param param0
   * @returns {*}
   */
  static sendFatalError({ res, statusCode = status.INTERNAL_SERVER_ERROR, message = "Internal server error", body = {}, error, stack }) {
    return res.status(statusCode).send({ message, body, error, stack });
  }
}

module.exports = Response;
