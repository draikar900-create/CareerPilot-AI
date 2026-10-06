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
import mlRoutes from './routes/mlRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import learningRoutes from './routes/learningRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Header protection
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.FRONTEND_ORIGIN
  ? process.env.FRONTEND_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5199'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Access denied for origin ' + origin));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});

app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  console.log(`[INCOMING] ${req.method} ${req.url}`);
  next();
});

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CareerPilot AI API is running',
    health: '/health'
  });
});

// Health Check Endpoints
const handleHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CareerPilot AI backend is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
};

app.get('/health', handleHealth);
app.get('/api/health', handleHealth);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', careerRoutes);
app.use('/api', opportunityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/contact', contactRoutes);


// 404 Handler for unknown routes
app.use((req, res) => {
  console.log(`[404] ${req.method} ${req.originalUrl} not found`);
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

const server = app.listen(PORT, () => {
  const env = process.env.NODE_ENV || 'development';
  console.log('\n==================================================');
  console.log('CareerPilot AI Backend');
  console.log(`Environment: ${env}`);
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log('==================================================\n');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use by another process.`);
    console.error(`👉 Stop any background server or run 'npx kill-port 5000' before running 'npm run dev'.\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

export default app;
