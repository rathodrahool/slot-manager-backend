import * as Joi from 'joi';

export const loginJoi = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  device_id: Joi.string().required(),
});
