import * as Joi from 'joi';

export const changePasswordJoi = Joi.object({
  current_password: Joi.string().required(),
  new_password: Joi.string()
    .min(8)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\[\]#])[A-Za-z\d@$!%*?&\[\]#]{8,}$/,
    )
    .messages({
      'string.pattern.base':
        'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&[]#).',
    })
    .required(),
});
