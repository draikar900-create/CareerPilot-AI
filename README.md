# CareerPilot AI 🚀

> **An AI-powered career guidance, placement analytics, and student readiness platform.**

---

## 📌 Overview

**CareerPilot AI** is a multi-role educational platform designed for **Students, Faculty, Placement Officers (TPO), and System Administrators**. It integrates real-time learning roadmaps, AI-driven placement probability analytics, year-wise assessment engines, and direct corporate recruitment tracking.

---

## ✨ Features & Portals

### 🎓 1. Student Portal
- **Career Roadmaps:** Milestone-driven learning paths (Beginner, Intermediate, Advanced) with ATS resume templates.
- **Skill Intelligence:** Skill gap breakdown using radar charts and industry benchmark comparisons.
- **Year-Wise Readiness Assessments:** Adaptive tests customized for 1st, 2nd, 3rd, and 4th-year engineering curriculum.
- **Opportunities & Applications:** Real-time job, internship, and campus placement drive application tracking.
- **AI Career Co-Pilot:** Instant guidance for interview preparation, resume reviews, and career domain matching.

### 👨‍🏫 2. Faculty Portal
- **Student Analytics:** Inspect assigned student cohorts, skill scores, and readiness progress.
- **Classroom Training Hub:** Publish learning resources, assign roadmaps, and monitor student milestones.

### 💼 3. Placement Officer (TPO) Portal
- **Eligibility Rule Engine:** Set department CGPA and active backlog eligibility criteria for campus drives.
- **Drive Management:** Create and manage company recruitment drives, student applications, and status updates.

### 🛡️ 4. Admin Portal
- **Multi-College SaaS Management:** Administer colleges, departments, banners, system notifications, and user roles.

### 🤖 5. ML Placement Prediction Engine & XAI
- **Prediction Model:** Scikit-learn Logistic Regression & Random Forest classifier ($97.08\%$ test accuracy, $0.9892$ ROC-AUC).
- **Dataset Provenance:** 1,200-record synthetic/benchmark placement dataset modeled on realistic engineering-college placement distributions (`ml_service/placement_data.csv`).
- **Explainable AI (XAI):** Mathematically derived feature contributions ($\beta_i \cdot x_i$) showing top positive drivers (CGPA, Internships) and improvement areas (Assessment Score, Coding Projects).
- **Microservice & Fallback:** Powered by FastAPI (`ml_service/app.py` on port 8000) with an embedded Logistic Regression pipeline fallback inside `backend/services/mlService.js` for 100% availability.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite 5, Tailwind CSS, Lucide Icons, Recharts, Canvas Confetti
- **Backend:** Node.js, Express.js, Zod Validation, Google Gemini AI Engine
- **Database & Auth:** Supabase PostgreSQL, Supabase GoTrue Auth, Service Role Security
- **Machine Learning:** Python 3.11, FastAPI, Scikit-learn, Joblib, Pandas, NumPy

---

## 📁 Project Directory Structure

```text
CareerPilot-AI/
├── backend/
│   ├── config/             # Supabase & environment configurations
│   ├── middleware/         # Auth JWT verification & role authorization
│   ├── migrations/         # PostgreSQL schema DDL SQL scripts
│   ├── routes/             # Auth, Profile, ML, Assessment, Faculty, Admin APIs
│   ├── scripts/            # Database seeders & test scripts
│   ├── services/           # ML Service & Resume Streaming logic
│   ├── utils/              # Zod validation schemas
│   └── server.js           # Express server entry point (Port 5000)
├── ml_service/             # FastAPI ML Microservice & Trained Models
│   ├── app.py              # FastAPI server entry point (Port 8000)
│   ├── train_model.py      # ML Pipeline training script
│   ├── placement_data.csv  # 1,200-record benchmark placement dataset
│   └── saved_model/        # Serialized joblib pipeline & metadata
├── public/                 # Static branding assets
├── src/
│   ├── components/         # Student, Admin, Faculty, TPO, Auth & Common UI
│   ├── context/            # React Context Providers (Auth, Profile, Placement, etc.)
│   ├── services/           # Unified API Service module
│   ├── App.jsx             # Main routing shell
│   └── main.jsx            # React root entry point
├── .env.example            # Frontend environment template
├── .gitignore              # Strictly ignores secrets, node_modules & build artifacts
├── index.html              # Single Page App HTML container
├── package.json            # Frontend dependencies & scripts
└── vite.config.js          # Vite server configuration (Port 5199)
```

---

## 🚀 Low-Cost Production Deployment Guide

1. **Frontend (Vercel / Netlify)**:
   - Deploy root directory to Vercel/Netlify.
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`.

2. **Backend (Render / Railway)**:
   - Deploy `backend/` directory to Render Web Service or Railway.
   - Start Command: `npm start` (`node --experimental-websocket server.js`)
   - Environment Variables: `PORT=5000`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `GOOGLE_API_KEY`, `FRONTEND_ORIGIN`.

3. **Database & Storage (Supabase)**:
   - PostgreSQL hosted on Supabase Free Tier.
   - Enable Row-Level Security (RLS) on all tables.
   - Resumes bucket configured with secure proxy stream access.

4. **Machine Learning Service**:
   - The backend includes an embedded Scikit-learn Logistic Regression pipeline fallback inside `backend/services/mlService.js`, allowing full prediction deployment directly on Node.js without requiring dedicated Python hosting.

---

## 🔒 Security Best Practices

- `.gitignore` is configured to prevent committing credentials (`.env`, `node_modules/`, `dist/`).
- API keys, JWT service role secrets, and database passwords must never be checked into public repositories.
- Use `.env.example` as a template when deploying to production environments.

---

## 🤝 License & Author

Developed for CareerPilot AI. All rights reserved.

