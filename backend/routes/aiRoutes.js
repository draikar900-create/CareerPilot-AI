import express from 'express';
import dotenv from 'dotenv';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import AIProviderFactory from '../services/aiProviderService.js';

dotenv.config();

const router = express.Router();

/**
 * GET /api/ai/health
 * Returns status of currently configured AI provider (Ollama / Gemini)
 * Does NOT leak API keys or sensitive backend credentials.
 */
router.get('/health', async (req, res) => {
  try {
    const health = await AIProviderFactory.getHealth();
    return res.status(health.available ? 200 : 503).json({
      success: health.available,
      health
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to inspect AI provider health: ' + err.message
    });
  }
});

/**
 * POST /api/ai/chat
 * Authenticated Student Career Guidance AI using AIProviderFactory
 * Enriches prompt with student's private career context
 */
router.post('/chat', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid prompt message.'
      });
    }

    // 1. Resolve Provider via AIProviderFactory (Ollama / Gemini)
    let provider;
    try {
      provider = AIProviderFactory.getProvider();
    } catch (configErr) {
      return res.status(500).json({
        success: false,
        message: configErr.message
      });
    }

    // 2. Fetch authenticated user's private context
    const [
      { data: profile },
      { data: goal },
      { data: roadmap },
      { data: skills },
      { data: progress }
    ] = await Promise.all([
      supabaseAdmin.from('student_profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabaseAdmin.from('career_goals').select('*').eq('user_id', userId).eq('status', 'active').maybeSingle(),
      supabaseAdmin.from('roadmaps').select('*').eq('user_id', userId).maybeSingle(),
      supabaseAdmin.from('student_skills').select('*').eq('user_id', userId),
      supabaseAdmin.from('progress_tracking').select('*').eq('user_id', userId).maybeSingle()
    ]);

    // 3. Build system context string
    const studentContext = `
Student Context (AUTHENTICATED USER ID: ${userId}):
- Name: ${profile?.full_name || 'Student'}
- College: ${profile?.college_name || 'Engineering College'}
- Branch: ${profile?.branch || 'Computer Science / IT'}
- Semester: ${profile?.semester || 'N/A'} (CGPA: ${profile?.cgpa || 'N/A'})
- Target Role: ${goal?.target_role || 'Software Engineer'}
- Target Company: ${goal?.target_company || 'Top Tech Companies'}
- Focus Skills: ${(goal?.focus_skills || []).join(', ') || 'Full Stack Development, Algorithms'}
- Acquired Skills: ${(profile?.technical_skills || []).join(', ') || 'None listed'}
- GitHub: ${profile?.github_url || 'Not provided'}
- LinkedIn: ${profile?.linkedin_url || 'Not provided'}
- Active Roadmap: ${roadmap?.title || 'Engineering Master Roadmap'}
- Overall Progress Score: ${progress?.overall_score || 50}%
`;

    const systemPrompt = `You are CareerPilot AI, an elite AI career counselor and technical mentor for engineering students.
Always provide encouraging, practical, and highly specific guidance tailored to the student's background.

${studentContext}

Use the student's specific profile, skills, and target goals to tailor your response. Be concise, structured, and action-oriented.`;

    // 4. Generate AI response via common provider abstraction
    let replyText;
    try {
      replyText = await provider.generateText({
        systemPrompt,
        userMessage: message,
        temperature: 0.7
      });
    } catch (aiErr) {
      console.warn('AI Provider error, falling back to rule-based AI advisor:', aiErr.message);
      replyText = `Hello ${profile?.full_name || 'Student'}! Here is career guidance tailored for your focus in ${goal?.target_role || 'Software Engineering'}:

1. **Core Skills**: Focus on strengthening your fundamentals in ${goal?.focus_skills?.join(', ') || 'Data Structures, Algorithms, and System Design'}.
2. **Project Portfolio**: Build at least 2 full-stack or domain-specific projects showcasing problem-solving and clean code.
3. **Practice & Readiness**: Regularly solve practice problems on LeetCode/HackerRank and take CareerPilot Mock Assessments.
4. **Networking**: Keep your LinkedIn and GitHub updated with recent achievements.

*(AI Advisor Note: ${aiErr.message})*`;
    }

    return res.status(200).json({
      success: true,
      provider: process.env.AI_PROVIDER || 'gemini',
      reply: replyText
    });

  } catch (err) {
    console.error('Error in POST /api/ai/chat:', err.message);
    const msg = err.message || '';
    let statusCode = 502;
    if (msg.includes('Key') || msg.includes('invalid') || msg.includes('401')) statusCode = 401;
    if (msg.includes('quota') || msg.includes('429')) statusCode = 429;
    if (msg.includes('not configured')) statusCode = 500;

    return res.status(statusCode).json({
      success: false,
      message: err.message
    });
  }
});

export default router;
