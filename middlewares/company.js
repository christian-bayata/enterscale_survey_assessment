const Joi = require("joi");
const Response = require("../utils/response");
const companyRespository = require("../repositories/company");
const status = require("../status-codes");
const jwt = require("jsonwebtoken");

/**
 * @Responsibility: Validation middleware for company sign up
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */

const signupValidation = async (req, res, next) => {
  const payload = req.body;

  try {
    const schema = Joi.object({
      name: Joi.string().min(10).max(100).required(),
      address: Joi.string().max(100).required(),
      state: Joi.string().max(50).required(),
      city: Joi.string().max(50).required(),
      verCode: Joi.string().max(6).required(),
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .lowercase()
        .required(),
      password: Joi.string().min(6).required(),
    });

    const { error, value } = schema.validate(payload);

    if (error) {
      return Response.sendError({ res, message: error.details[0].message });
    }

    res.data = value;
    return next();
  } catch (error) {
    return error;
  }
};

/**
 * @Responsibility: Validation middleware for user login
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */

const loginValidation = async (req, res, next) => {
  const payload = req.body;

  try {
    const schema = Joi.object({
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .lowercase()
        .required(),
      password: Joi.string().min(6).required(),
    });

    const { error, value } = schema.validate(payload);

    if (error) {
      return Response.sendError({ res, message: error.details[0].message });
    }

    res.data = value;
    return next();
  } catch (error) {
    return error;
  }
};

/**
 * @Responsibility:  Middleware authentication for company
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */

const authenticateCompany = async (req, res, next) => {
  let { authorization } = req.headers;
  const { userId } = req.body;

  if (!authorization) {
    authorization = req.body.authorization;
  }

  /* decode jwt token from req header */
  const decode = jwt.verify(authorization, process.env.JWT_SECRET_KEY, (err, decoded) => decoded);

  /* if token is invalid or has expired */
  if (!authorization || !decode || !decode._id) {
    return Response.sendError({ res, statusCode: status.UNAUTHENTICATED, message: "Unauthenticated! Please login" });
  }

  try {
    res.company = decode;
    return next();
  } catch (error) {
    // console.log(error);
    return Response.sendFatalError({ res });
  }
};

module.exports = {
  signupValidation,
  loginValidation,
  authenticateCompany,
};
