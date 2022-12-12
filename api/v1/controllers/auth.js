const userRepository = require("../../../repositories/user");
const Response = require("../../../utils/response");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
// import { BuildResponse } from "../../../utils/interfaces/utils.interfaces";
// import sendEmail from "../../../utils/send_email";
// import indexModel from "../../../models/index.model";
const status = require("../../../status-codes");

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
    const confirmEmail = await userRepository.findUser({ email });
    if (confirmEmail) return Response.sendError({ res, statusCode: status.BAD_REQUEST, error: "You already have an account with us" });

    /* Create verification code for user */
    const verToken = { email, code: crypto.randomBytes(3).toString("hex").toUpperCase() };
    const userToken = await userRepository.createVerToken(verToken);

    /* Send verification code to company's email address */
    const message = `Hello, your verification token is ${userToken.token}.\n\n Thanks and regards`;
    await sendEmail({ email, subject: "Verification Code", message });

    return Response.sendSuccess({ res, statusCode: status.CREATED, message: "Code successfully sent", body: userToken });
  } catch (error) {
    console.log("********************: ", error);
    return Response.sendFatalError({ res });
  }
};

module.exports = { verificationCode };
