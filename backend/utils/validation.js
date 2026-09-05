import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone number is required'),
  password: z.string().min(1, 'Password is required')
});

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const profileUpdateSchema = z.object({
  full_name: z.string().optional(),
  phone: z.string().optional(),
  date_of_birth: z.string().nullable().optional(),
  college_name: z.string().optional(),
  branch: z.string().optional(),
  semester: z.number().min(1).max(10).optional(),
  cgpa: z.number().min(0.0).max(10.0).optional(),
  graduation_year: z.number().optional(),
  technical_skills: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  github_url: z.string().url().nullable().or(z.literal('')).optional(),
  linkedin_url: z.string().url().nullable().or(z.literal('')).optional(),
  resume_url: z.string().nullable().optional()
});

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstError = result.error.errors[0]?.message || 'Invalid input data';
      return res.status(400).json({
        success: false,
        message: firstError,
        errors: result.error.errors
      });
    }
    req.validatedBody = result.data;
    next();
  };
}
