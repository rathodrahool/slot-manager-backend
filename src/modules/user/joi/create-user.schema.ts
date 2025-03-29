import * as Joi from 'joi';

export const createUserJoi = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().uuid().required(),
});
