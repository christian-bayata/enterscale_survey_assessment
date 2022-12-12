const userRepository = require("../../../repositories/user");
const tokenRepository = require("../../../repositories/token");
const Response = require("../../../utils/response");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const sendEmail = require("../../../utils/send_email");
const status = require("../../../status-codes");
const _ = require("lodash");

/**
 * @Title Company verification code
 * @Param req
 * @Param res
 * @Returns Returns the verification code of the company
 *
 */
const verificationCode = async (req, res) => {
  const { email } = req.body;
  if (!email) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Please provide an email" });

  try {
    /* Check if user with this email already exists */
    const confirmEmail = await userRepository.findUser(email);
    if (confirmEmail) return Response.sendError({ res, statusCode: status.BAD_REQUEST, error: "You already have an account with us" });

    /* Create verification code for user */
    const verToken = { email, token: crypto.randomBytes(3).toString("hex").toUpperCase() };
    const userToken = await tokenRepository.createVerToken(verToken);

    /* Send verification code to company's email address */
    const message = `Hello, your verification token is ${userToken.token}.\n\n Thanks and regards`;
    await sendEmail({ email, subject: "Verification Code", message });

    return Response.sendSuccess({ res, statusCode: status.CREATED, message: "Code successfully sent", body: userToken });
  } catch (error) {
    // console.log("********************: ", error);
    return Response.sendFatalError({ res });
  }
};

/**
 * @Responsibility:  Company signs up
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */

const signUp = async (req, res) => {
  const { data } = res;

  try {
    /* Check if user already exists */
    const userExists = await userRepository.findUser(data.email);
    if (userExists) return Response.sendError({ res, statusCode: status.CONFLICT, message: "User already exists" });

    const confirmUserVerCode = await tokenRepository.confirmVerToken({ email: data.email, token: data.verCode });
    if (!confirmUserVerCode) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Invalid verification code, please try again." });

    /* Delete token if the received time is past 30 minutes */
    const timeDiff = +(Date.now() - confirmUserVerCode.createdAt.getTime());
    const timeDiffInMins = +(timeDiff / (1000 * 60));
    if (timeDiffInMins > 30) {
      await tokenRepository.deleteVerToken({ email: data.email, token: data.verCode });
      return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "The verification code has expired, kindly request another." });
    }

    const companyData = { name: data.name, email: data.email, address: data.address, state: data.state, password: data.password, city: data.city };
    const createCompany = await userRepository.createUser(companyData);
    const theCompany = _.pick(createCompany, ["_id", "name", "address", "email", "state", "city"]);

    return Response.sendSuccess({ res, statusCode: status.CREATED, message: "Company successfully signed up", body: theCompany });
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

module.exports = { verificationCode, signUp };
