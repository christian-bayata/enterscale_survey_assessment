const { Router } = require("express");
// const userMiddleware = require("../../../middlewares/user");
const userController = require("../controllers/auth");

const authRouter = Router();

authRouter.post("/verification-code", userController.verificationCode);

// userRouter.patch("/update-user/:id", userMiddleware.authenticateUser, userMiddleware.updateUserValidation, userController.updateUser);

// userRouter.delete("/delete-user/:id", userMiddleware.isAdmin, userController.deleteUser);

module.exports = authRouter;
