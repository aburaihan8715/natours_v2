import { z } from 'zod';

const registerValidationSchema = z.object({
  body: z.object({
    username: z
      .string({
        required_error: 'Username is required',
      })
      .min(1, { message: 'Username cannot be empty' })
      .trim(),

    email: z
      .string({
        required_error: 'Email is required',
      })
      .email({ message: 'Invalid email address' })
      .trim(),

    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(6, { message: 'Password must be at least 6 characters long' }),

    profilePicture: z.string().optional(),

    role: z.enum(['user', 'admin']).optional(),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required.' })
      .email({ message: 'Invalid email address' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

export const AuthValidations = {
  registerValidationSchema,
  loginValidationSchema,
};
