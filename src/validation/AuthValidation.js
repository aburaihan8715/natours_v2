import { z } from 'zod';

const registerValidationSchema = z.object({
  body: z
    .object({
      username: z
        .string({ required_error: 'Username is required.' })
        .min(1, { message: 'Username is required.' }),

      email: z
        .string({ required_error: 'Email is required.' })
        .email({ message: 'Invalid email format.' }),
      password: z
        .string({ required_error: 'Password is required.' })
        .min(6, {
          message: 'Password must be at least 6 characters long.',
        }),

      passwordConfirm: z
        .string({ required_error: 'Password confirmation is required.' })
        .min(6, {
          message: 'Password confirmation must match password length.',
        }),

      passwordChangedAt: z
        .date()
        .optional()
        .nullable()
        .or(z.string().datetime().optional()),

      passwordResetToken: z.string().optional().nullable(),

      passwordResetExpires: z.date().optional().nullable(),

      profilePicture: z.string().optional().nullable(),

      role: z
        .enum(['user', 'guide', 'lead-guide', 'admin'])
        .default('user'),

      active: z.boolean().default(true),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      path: ['passwordConfirm'],
      message: 'Passwords do not match.',
    }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required.' })
      .email({ message: 'Invalid email format.' }),
    password: z
      .string({ required_error: 'Password is required.' })
      .min(6, { message: 'Password must be at least 6 characters long.' }),
  }),
});

export const AuthValidations = {
  registerValidationSchema,
  loginValidationSchema,
};
