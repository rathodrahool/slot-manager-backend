import * as Joi from 'joi';

export const forgetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});
