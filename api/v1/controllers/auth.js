require("express-async-errors");
const companyRespository = require("../../../repositories/company");
const tokenRepository = require("../../../repositories/token");
const Response = require("../../../utils/response");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const sendEmail = require("../../../utils/send_email");
const status = require("../../../status-codes");
const _ = require("lodash");
const mongoose = require("mongoose");
const helper = require("../../../utils/helper");

/**
 * @Responsibility: Company verification code
 * @Param req
 * @Param res
 * @Returns Returns the verification code of the company
 *
 */
const verificationCode = async (req, res) => {
  const { email } = req.body;
  if (!email) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Please provide an email" });

  try {
    /* Check if company with this email already exists */
    const confirmEmail = await companyRespository.findCompany({ email });
    if (confirmEmail) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "You already have an account with us" });

    /* Check if token already exists */
    const confirmToken = await tokenRepository.confirmVerToken({ email });
    if (confirmToken) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "token already exists" });

    /* Create verification code for user */
    const verToken = { email, token: crypto.randomBytes(3).toString("hex").toUpperCase() };
    const userToken = await tokenRepository.createVerToken(verToken);

    /* Send verification code to company's email address */
    const message = `Hello, your verification token is ${userToken.token}.\n\n Thanks and regards`;
    await sendEmail({ email, subject: "Verification token", message });

    return Response.sendSuccess({ res, statusCode: status.OK, message: "Token successfully sent", body: userToken });
  } catch (error) {
    // console.log("********************: ", error);
    return Response.sendFatalError({ res });
  }
};

/**
 * @Responsibility:  Company signs up
 * @param req
 * @param res
 * @returns {Promise<*>}
 */

const signUp = async (req, res) => {
  const { data } = res;

  /*  Start mongoose transaction */
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    /* Check if user already exists */
    const company = await companyRespository.findCompany({ email: data.email });
    if (company) return Response.sendError({ res, statusCode: status.CONFLICT, message: "Company already exists" });

    const confirmUserVerToken = await tokenRepository.confirmVerToken({ email: data.email, token: data.verCode });
    if (!confirmUserVerToken) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Invalid verification token, please try again." });

    /* Delete token if the received time is past 30 minutes */
    const timeDiff = +(Date.now() - confirmUserVerToken.createdAt.getTime());
    const timeDiffInMins = +(timeDiff / (1000 * 60));
    if (timeDiffInMins > 30) {
      await tokenRepository.deleteVerToken({ email: data.email, token: data.verCode });
      return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "The verification token has expired, kindly request another." });
    }

    const companyData = { name: data.name, email: data.email, address: data.address, state: data.state, password: data.password, city: data.city };
    const createCompany = await companyRespository.createCompany(companyData, { session });
    const theCompany = _.pick(createCompany, ["_id", "name", "address", "email", "state", "city"]);
    await tokenRepository.deleteVerToken({ email: data.email, token: data.verCode }, { session });
    /* Commit the changes made */
    await session.commitTransaction();

    return Response.sendSuccess({ res, statusCode: status.CREATED, message: "Company successfully signed up", body: theCompany });
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  } finally {
    /* Ending the session */
    session.endSession();
  }
};

/**
 * @Responsibility:  Logs in an already signed up company
 * @param req
 * @param res
 * @returns {Promise<*>}
 */

const login = async (req, res) => {
  const { data } = res;

  try {
    const company = await companyRespository.findCompany({ email: data.email });
    if (!company) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "Sorry you do not have an account with us. Please sign up" });

    /* validate user password with bcrypt */
    const validPassword = await company.comparePassword(data.password);
    if (!validPassword) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Incorrect Password! Unauthorized" });

    /* Generate JWT token for user */
    const token = company.generateJsonWebToken();

    /* Format and hash user data for security */
    const protectedData = helper.formatCompanyData(data);

    return Response.sendSuccess({ res, statusCode: status.OK, message: "User successfully logged in", body: { token, userData: protectedData } });
  } catch (error) {
    // console.log(error);
    return Response.sendFatalError({ res });
  }
};

/**
 * @Responsibility: Provide company with password reset token
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Please provide a valid email" });

  try {
    const company = await companyRespository.findCompany({ email });
    if (!company) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "Sorry you do not have an account with us. Please sign up" });

    //Create reset password token and save
    const getResetToken = await helper.resetToken(company);

    const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${getResetToken}`;

    //Set the password reset email message for company
    const message = `This is your password reset token: \n\n${resetUrl}\n\nIf you have not requested this email, then ignore it`;

    //The reset token email
    await sendEmail({ email: company.email, subject: "Password Recovery", message });

    return Response.sendSuccess({ res, statusCode: status.OK, message: "Password reset token successfully sent" });
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

/**
 * @Responsibility: Enables company to reset password with reset token
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */

const resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.params;

  try {
    const company = await companyRespository.findCompany({ resetPasswordToken: token });
    if (!company) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Password reset token is invalid" });

    // Check to see if the token is still valid
    const timeDiff = +(Date.now() - company.resetPasswordDate.getTime());
    const timeDiffInMins = +(timeDiff / (1000 * 60));

    if (timeDiffInMins > 30) {
      company.resetPasswordToken = undefined;
      company.resetPasswordDate = undefined;
      await company.save();

      return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Password reset token has expired" });
    }

    // Confirm if the password matches
    if (password !== confirmPassword) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Password does not match" });

    // If password matches
    company.password = password;

    company.resetPasswordToken = undefined;
    company.resetPasswordDate = undefined;
    await company.save();

    // Generate another Auth token for company
    const authToken = company.generateJsonWebToken();

    /* Format and hash company data for security */
    const protectedData = helper.formatCompanyData(company);

    return Response.sendSuccess({ res, statusCode: status.OK, message: "Password reset is successful", body: { token: authToken, companyData: protectedData } });
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

module.exports = { verificationCode, signUp, login, forgotPassword, resetPassword };
