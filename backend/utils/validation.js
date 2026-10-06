import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone number is required'),
  password: z.string().min(1, 'Password is required')
});

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  role: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const profileUpdateSchema = z.object({
  full_name: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  college_name: z.string().nullable().optional(),
  branch: z.string().nullable().optional(),
  semester: z.number().min(1).max(10).nullable().optional(),
  cgpa: z.number().min(0.0).max(10.0).nullable().optional(),
  graduation_year: z.number().nullable().optional(),
  technical_skills: z.array(z.string()).nullable().optional(),
  achievements: z.array(z.string()).nullable().optional(),
  github_url: z.string().nullable().optional(),
  linkedin_url: z.string().nullable().optional(),
  resume_url: z.string().nullable().optional(),
  onboarding_completed: z.boolean().nullable().optional(),
  onboarding_completed_at: z.string().nullable().optional(),
  college_id: z.string().nullable().optional(),
  department_id: z.string().nullable().optional(),
  academic_year: z.string().nullable().optional(),
  section: z.string().nullable().optional(),
  batch: z.string().nullable().optional(),
  student_id: z.string().nullable().optional(),
  target_role: z.string().nullable().optional(),
  career_interests: z.array(z.string()).nullable().optional(),
  preferred_domains: z.array(z.string()).nullable().optional(),
  preferred_technologies: z.array(z.string()).nullable().optional(),
  intro_seen: z.boolean().nullable().optional(),
  gender: z.string().nullable().optional(),
  current_onboarding_step: z.number().nullable().optional()
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
