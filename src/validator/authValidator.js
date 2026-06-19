import { z } from 'zod';

// Define a schema for registration validation

const registrationSchema = z.object({
  //email is required and must be a valid email address
  email: z
    .string()
    .email('Invalid email address'),
  // password is required and must be at least 8 characters long
  // with at least one uppercase letter, one lowercase letter, one number and one special character
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password must be at most 100 characters long' )
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*_\-]/, 'Password must contain at least one special character'),
})

const loginSchema = z.object({
  // email is required and must be a valid email address
  email: z
    .string()
    .email('Invalid email address'),
    // password is required and must be at least 8 characters long
    // with at least one uppercase letter, one lowercase letter, one number and one special character
  password: z
    .string()
    .min(1),
})

const forgotPasswordSchema = z.object({
  // email is required and must be a valid email address
  email: z
    .string()
    .email('Invalid email address'),
})

const resetPasswordSchema = z.object({
  // newPassword is required and must be at least 8 characters long
  // with at least one uppercase letter, one lowercase letter, one number and one special character
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password must be at most 100 characters long' )
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*_\-]/, 'Password must contain at least one special character'),
  confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
})

export { registrationSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema };