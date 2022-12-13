const { Router } = require("express");
const companyMiddleware = require("../../../middlewares/company");
const authController = require("../controllers/auth");

const authRouter = Router();

authRouter.post("/verification-code", authController.verificationCode);

authRouter.post("/signup", companyMiddleware.signupValidation, authController.signUp);

authRouter.post("/login", companyMiddleware.loginValidation, authController.login);

module.exports = authRouter;
