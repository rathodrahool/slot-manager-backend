import * as Joi from 'joi';

export const CreateRoleSchema = Joi.object({
  name: Joi.string().required(),
  section: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        permission: Joi.array()
          .items(
            Joi.object({
              id: Joi.string().required(),
              has_access: Joi.boolean().required(),
            }),
          )
          .required(),
      }),
    )
    .required(),
});
