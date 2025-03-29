import * as Joi from 'joi';

export const UpdateSectionSchema = Joi.object({
  name: Joi.string(),
});
