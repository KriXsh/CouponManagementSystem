import Joi from 'joi';

const createCouponSchema = Joi.object({
    type: Joi.string()
        .valid('cart-wise', 'product-wise', 'BxGy')
        .required()
        .messages({
            'string.base': 'Type must be a string.',
            'any.required': 'Type is required.',
            'string.valid': 'Type must be one of: cart-wise, product-wise, BxGy.'
        }),
    discountDetails: Joi.object().required().messages({
        'object.base': 'Discount details must be an object.',
        'any.required': 'Discount details are required.'
    }),
    conditions: Joi.object().required().messages({
        'object.base': 'Conditions must be an object.',
        'any.required': 'Conditions are required.'
    }),
    repetitionLimit: Joi.number().integer().positive().optional().messages({
        'number.base': 'Repetition limit must be a number.',
        'number.integer': 'Repetition limit must be an integer.',
        'number.positive': 'Repetition limit must be positive.'
    }),
    validityStart: Joi.date().iso().required().messages({
        'date.base': 'Validity start must be a valid date.',
        'any.required': 'Validity start is required.'
    }),
    validityEnd: Joi.date().iso().required().messages({
        'date.base': 'Validity end must be a valid date.',
        'any.required': 'Validity end is required.'
    })
});


const updateCouponSchema = Joi.object({
    type: Joi.string().valid('cart-wise', 'product-wise', 'BxGy').optional(),
    discountDetails: Joi.object().optional(),
    conditions: Joi.object().optional(),
    repetitionLimit: Joi.number().integer().positive().optional(),
    validityStart: Joi.date().iso().optional(),
    validityEnd: Joi.date().iso().optional()
});

const cartSchema = Joi.object({
    items: Joi.array().items(
        Joi.object({
            productId: Joi.string().required(),
            quantity: Joi.number().integer().positive().required(),
            price: Joi.number().positive().required()
        })
    ).required(),
    total: Joi.number().positive().required()
});


export {
    createCouponSchema,
    updateCouponSchema,
    cartSchema
}


