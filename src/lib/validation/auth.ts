import { z } from 'zod'

export const authSchema = z
  .object({
    mode: z.enum(['signin', 'signup']),
    displayName: z.string().trim().max(60, 'Name is too long').optional(),
    email: z.email('Enter a valid email address').trim().min(1, 'Email is required'),
    password: z.string().min(1, 'Password is required'),
  })
  .superRefine((values, ctx) => {
    if (values.mode === 'signup' && values.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password'],
        message: 'Password must be at least 8 characters',
      })
    }
  })

export type AuthFormValues = z.infer<typeof authSchema>
