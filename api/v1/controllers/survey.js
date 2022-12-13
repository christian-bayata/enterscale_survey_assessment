require("express-async-errors");
const Response = require("../../../utils/response");
const status = require("../../../status-codes");
const surveyRepository = require("../../../repositories/survey");

const createCompanySurvey = async (req, res) => {
  const { company } = res;
  const { title } = req.body;

  if (!company) return Response.sendError({ res, statusCode: status.UNAUTHENTICATED, message: "Uauthenticated user. Please login" });
  if (!title) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Please provide the title of the survey" });

  try {
    const companySurvey = await surveyRepository.createSurvey({ title, company: company.id });
    const surveyUrl = `http://localhost:8000/api/v1/get-survey/${companySurvey.slug}`;

    return Response.sendSuccess({ res, statusCode: status.OK, message: "Survey url successfully created", body: surveyUrl });
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

module.exports = {
  createCompanySurvey,
};
