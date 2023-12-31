const Joi = require("@hapi/joi");

const resisterSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(2).required(),
  name: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(2).required(),
});

module.exports = {
  resisterSchema,
  loginSchema,
};
