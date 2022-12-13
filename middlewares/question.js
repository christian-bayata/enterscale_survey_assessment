const Joi = require("joi");

/**
 * @Responsibility: Validation middleware for creating question(s)
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */

const createQuestionValidation = async (req, res, next) => {
  let payload = req.body;

  try {
    const schema = Joi.object({
      question: Joi.string().required(),
      survey: Joi.string().required(),
    });

    const { error, value } = schema.validate(payload);

    if (error) {
      return Response.sendError({ res, message: error.details[0].message });
    }

    res.data = value;
    return next();
  } catch (error) {
    return error;
  }
};

module.exports = { createQuestionValidation };
