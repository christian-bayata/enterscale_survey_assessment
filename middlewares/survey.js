const Joi = require("joi");

/**
 * @Responsibility: Validation middleware for responding to a survey
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */

const responseToQuesValidation = async (req, res, next) => {
  let payload = req.body;

  try {
    const schema = Joi.array()
      .items(
        Joi.object({
          question: Joi.string().required(),
          answer: Joi.string().required(),
        })
      )
      .required();

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

module.exports = { responseToQuesValidation };
