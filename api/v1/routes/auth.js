const { Router } = require("express");
const userMiddleware = require("../../../middlewares/user");
const authController = require("../controllers/auth");

const authRouter = Router();

authRouter.post("/verification-code", authController.verificationCode);

authRouter.post("/signup", userMiddleware.signupValidation, authController.signUp);

// userRouter.patch("/update-user/:id", userMiddleware.authenticateUser, userMiddleware.updateUserValidation, userController.updateUser);

// userRouter.delete("/delete-user/:id", userMiddleware.isAdmin, userController.deleteUser);

module.exports = authRouter;
