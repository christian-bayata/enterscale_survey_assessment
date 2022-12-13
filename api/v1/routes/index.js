const { Router } = require("express");
const authRouter = require("./auth");
const surveyRouter = require("./survey");
const questionRouter = require("./question");

const router = Router();

router.use("/auth", authRouter);
router.use("/survey", surveyRouter);
router.use("/question", questionRouter);

module.exports = router;
