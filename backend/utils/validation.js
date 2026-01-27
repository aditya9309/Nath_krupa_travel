import Joi from 'joi';

// User validation schemas
export const registerSchema = Joi.object({
  name: Joi.string().required().trim().min(2).max(50)
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must not exceed 50 characters'
    }),
  email: Joi.string().email().required().lowercase().trim()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),
  phone: Joi.string().required().trim().pattern(/^[0-9]{10}$/)
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Phone number must be exactly 10 digits'
    }),
  password: Joi.string().required().min(6)
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters'
    })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().required()
});

export const verifyOTPSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim(),
  otp: Joi.string().required().length(6).pattern(/^[0-9]{6}$/)
    .messages({
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must contain only numbers'
    })
});

export const resendOTPSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim()
});

// Booking validation schemas
export const bookingSchema = Joi.object({
  idempotencyKey: Joi.string().optional().trim(),
  packageId: Joi.string().allow('', null).optional(),
  source: Joi.string().required().trim().min(2)
    .messages({
      'string.empty': 'Source is required',
      'string.min': 'Source must be at least 2 characters'
    }),
  destination: Joi.string().required().trim().min(2)
    .messages({
      'string.empty': 'Destination is required',
      'string.min': 'Destination must be at least 2 characters'
    }),
  journeyDate: Joi.date().required().min('now')
    .messages({
      'date.base': 'Journey date is required',
      'date.min': 'Journey date must be in the future'
    }),
  passengers: Joi.array().items(
    Joi.object({
      name: Joi.string().required().trim().min(2)
        .messages({
          'string.empty': 'Passenger name is required',
          'string.min': 'Passenger name must be at least 2 characters'
        }),
      dob: Joi.date().required().max('now')
        .messages({
          'date.base': 'Date of birth is required',
          'date.max': 'Date of birth cannot be in the future'
        }),
      gender: Joi.string().valid('male', 'female', 'other').required()
        .messages({
          'any.only': 'Gender must be male, female, or other',
          'any.required': 'Gender is required'
        })
    })
  ).min(1).max(20)
    .messages({
      'array.min': 'At least 1 passenger is required',
      'array.max': 'Maximum 20 passengers allowed'
    }),
  totalAmount: Joi.number().required().min(0)
    .messages({
      'number.base': 'Total amount is required',
      'number.min': 'Amount cannot be negative'
    })
});

// Trip Request validation schemas
export const tripRequestSchema = Joi.object({
  name: Joi.string().required().trim().min(2)
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters'
    }),
  email: Joi.string().email().required().trim()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),
  phone: Joi.string().required().trim().pattern(/^[0-9]{10}$/)
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Phone number must be exactly 10 digits'
    }),
  tripType: Joi.string().required().trim()
    .messages({
      'string.empty': 'Trip type is required'
    }),
  members: Joi.number().required().integer().min(1)
    .messages({
      'number.base': 'Number of members is required',
      'number.min': 'At least 1 member is required'
    }),
  budget: Joi.number().required().min(0)
    .messages({
      'number.base': 'Budget is required',
      'number.min': 'Budget cannot be negative'
    }),
  message: Joi.string().trim().allow('')
});

// Package validation schemas
export const packageSchema = Joi.object({
  title: Joi.string().required().trim().min(3),
  description: Joi.string().required().min(10),
  duration: Joi.string().required().trim(),
  price: Joi.number().required().min(0),
  category: Joi.string().valid('domestic', 'international', 'adventure', 'family', 'group'),
  route: Joi.string().trim().allow(''),
  highlights: Joi.array().items(Joi.string()),
  inclusions: Joi.array().items(Joi.string()),
  exclusions: Joi.array().items(Joi.string()),
  itinerary: Joi.array().items(
    Joi.object({
      day: Joi.number().required(),
      title: Joi.string().required(),
      description: Joi.string().required()
    })
  )
});

// Profile update schema
export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  phone: Joi.string().trim().pattern(/^[0-9]{10}$/)
});
