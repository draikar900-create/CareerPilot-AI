import express from 'express';
import dotenv from 'dotenv';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

dotenv.config();

const router = express.Router();

/**
 * POST /api/ai/chat
 * Student Career Guidance AI powered by Gemini 2.5 Flash
 * Enriches prompt with authenticated user's private career context
 */
router.post('/chat', authenticateUser, async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Gemini AI API Key (GOOGLE_API_KEY) is not configured on the backend server.'
      });
    }

    const userId = req.user.id;
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid prompt message.'
      });
    }

    // 1. Fetch authenticated user's context (profile, goals, roadmap, skills, progress)
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

    // 2. Build system context string
    const studentContext = `
Student Context (AUTHENTICATED USER ID: ${userId}):
- Name: ${profile?.full_name || 'Student'}
- College: ${profile?.college_name || 'Engineering College'}
- Branch: ${profile?.branch || 'Computer Science / IT'}
- Semester: ${profile?.semester || 'N/A'} (CGPA: ${profile?.cgpa || 'N/A'})
- Target Role: ${goal?.target_role || 'Software Engineer'}
- Target Company: ${goal?.target_company || 'Top Tech Companies'}
- Focus Skills: ${(goal?.focus_skills || []).join(', ') || 'Full Stack Development, Algorithms'}
- Acquired Skills: ${(skills || []).map(s => s.skill_name).join(', ') || 'Python, React, JavaScript'}
- Active Roadmap: ${roadmap?.title || 'Engineering Master Roadmap'}
- Overall Progress Score: ${progress?.overall_score || 50}%
`;

    const systemPrompt = `You are CareerPilot AI, an elite AI career counselor and technical mentor for engineering students.
Always provide encouraging, practical, and highly specific guidance tailored to the student's background.

${studentContext}

Use the student's specific profile, skills, and target goals to tailor your response. Be concise, structured, and action-oriented.`;

    // Call Gemini API using the official SDK
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    let lastError = null;
    let replyText = null;

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Message: ${message}` }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
          }
        });
        
        replyText = result.response.text();
        if (replyText) break; // Success
      } catch (e) {
        lastError = e;
        console.warn(`Gemini model ${modelName} attempt failed:`, e.message);
      }
    }

    if (!replyText) {
      let statusMsg = 'Gemini AI service is temporarily unavailable.';
      let statusCode = 502;
      const errText = (lastError?.message || '').toLowerCase();

      if (errText.includes('api key') || errText.includes('invalid') || errText.includes('400')) {
        statusMsg = 'Gemini API key is invalid. Please check your backend GOOGLE_API_KEY environment variable.';
        statusCode = 401;
      } else if (errText.includes('quota') || errText.includes('429') || errText.includes('exhausted')) {
        statusMsg = 'Gemini API rate limit or quota exceeded. Please try again shortly.';
        statusCode = 429;
      } else if (errText.includes('not found') || errText.includes('404')) {
        statusMsg = 'The requested Gemini model is not supported or not found for this API key.';
        statusCode = 404;
      }

      return res.status(statusCode).json({
        success: false,
        error: statusMsg,
        details: process.env.NODE_ENV === 'development' ? errText : undefined
      });
    }

    return res.status(200).json({
      success: true,
      reply: replyText
    });

  } catch (err) {
    console.error('Error in POST /api/ai/chat:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process AI chat query: ' + err.message
    });
  }
});

export default router;
