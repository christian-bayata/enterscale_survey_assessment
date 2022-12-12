const { Router } = require("express");
const userMiddleware = require("../../../middlewares/user");
const authController = require("../controllers/auth");

const authRouter = Router();

authRouter.post("/verification-code", authController.verificationCode);

authRouter.post("/signup", userMiddleware.signupValidation, authController.signUp);

authRouter.post("/login", userMiddleware.loginValidation, authController.login);

module.exports = authRouter;
