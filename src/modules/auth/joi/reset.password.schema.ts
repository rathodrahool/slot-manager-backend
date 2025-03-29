import * as Joi from 'joi';

export const resetPasswordSchema = Joi.object({
  email: Joi.string().required(),
  otp: Joi.number().required(),
  password: Joi.string().required(),
});
