const { Router } = require("express");
const companyMiddleware = require("../../../middlewares/company");
const authController = require("../controllers/auth");

const authRouter = Router();

authRouter.post("/verification", authController.verificationCode);

authRouter.post("/signup", companyMiddleware.signupValidation, authController.signUp);

authRouter.post("/login", companyMiddleware.loginValidation, authController.login);

authRouter.post("/forgot-password", authController.forgotPassword);

authRouter.patch("/reset-password/:token", authController.resetPassword);

module.exports = authRouter;
