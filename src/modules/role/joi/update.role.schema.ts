import * as Joi from 'joi';

export const UpdateRoleSchema = Joi.object({
  name: Joi.string(),
  role_section_permission: Joi.array().items(
    Joi.object({
      id: Joi.string(),
      has_access: Joi.boolean(),
    }),
  ),
});
