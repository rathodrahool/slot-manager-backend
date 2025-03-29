import * as Joi from 'joi';

export const CreateSectionSchema = Joi.object({
  name: Joi.string().required(),
});
