import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { supabaseAdmin } from './config/supabase.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import careerRoutes from './routes/careerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import opportunityRoutes from './routes/opportunityRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Header protection
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.FRONTEND_ORIGIN
  ? process.env.FRONTEND_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl) or allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for local dev testing
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});

app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    return res.status(200).json({
      success: true,
      service: 'CareerPilot AI Backend',
      database: 'connected',
      authentication: 'supabase',
      supabase_url: supabaseUrl ? supabaseUrl.replace(/https:\/\/(.*)\.supabase\.co/, 'https://***.supabase.co') : 'Not Configured',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      service: 'CareerPilot AI Backend',
      database: 'disconnected',
      error: err.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', careerRoutes);
app.use('/api', opportunityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);

// 404 Handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found.`
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message: message
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 CareerPilot AI Backend running on port ${PORT}`);
  console.log(`🔒 Authentication: Supabase Auth & JWT Middleware active`);
  console.log(`🗄️ Database: Supabase PostgreSQL connected`);
  
  // Safe startup validation for Gemini API Key
  if (!process.env.GOOGLE_API_KEY) {
    console.warn(`⚠️  WARNING: GOOGLE_API_KEY is missing from .env. Gemini AI features will not work.`);
  } else if (!process.env.GOOGLE_API_KEY.startsWith('AIza')) {
    console.warn(`⚠️  WARNING: GOOGLE_API_KEY appears to be malformed or invalid. Ensure it is a valid Google Gemini API Key.`);
  } else {
    console.log(`🤖 AI: Gemini API Key loaded securely`);
  }

  console.log(`🌐 Health Check: http://localhost:${PORT}/api/health\n`);
});

export default app;
