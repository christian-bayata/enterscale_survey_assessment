const { Router } = require("express");
const authRouter = require("./auth");
const surveyRouter = require("./survey");

const router = Router();

router.use("/auth", authRouter);
router.use("/survey", surveyRouter);

module.exports = router;
