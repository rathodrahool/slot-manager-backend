import * as Joi from 'joi';

export const UpdatePermissionSchema = Joi.object({
  name: Joi.string(),
});
