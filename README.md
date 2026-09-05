# CareerPilot AI 🚀

> **An AI-powered career guidance platform that helps students identify skill gaps, discover suitable career paths, and build personalized learning roadmaps.**

---

## 📌 Overview

**CareerPilot AI** is an intelligent career guidance platform designed to empower students and early professionals to make informed career decisions based on their **skills, interests, education, and career aspirations**.

Instead of providing generic recommendations, CareerPilot AI analyzes an individual's current profile against dynamic industry benchmarks and generates **personalized, actionable roadmaps** to guide them directly toward their career goals.

---

## ✨ Completed Frontend Modules

The frontend is built with **React 19**, **Vite**, and **Tailwind CSS**, delivering a responsive, modern, and interactive user experience across all devices.

### 🌟 1. Splash Screen
- Smooth, animated onboarding splash with branded visuals and progress indicators.
- Seamless auto-navigation to authentication or dashboard based on session state.

### 🔐 2. Authentication (Login & Sign Up)
- **Login Page**: Modern credentials-based authentication with remember-me, password toggle, and quick demo credentials.
- **Sign Up Page**: Multi-step student registration capturing education, stream, year of study, and interests.
- **OTP Verification & Forgot Password**: Secure verification flows with simulated verification codes.

### 👤 3. Student Profile
- Comprehensive profile management displaying academic history, skills, target roles, bio, and social/portfolio links.
- Interactive profile editing with avatar customization and completion badges.

### 📊 4. Dashboard & Analytics
- Central student hub featuring quick metric cards (Readiness Score, Skill Match %, Roadmaps in Progress, Upcoming Events).
- Integrated quick actions, trending career tracks, and personalized recommendations.

### 🎠 5. Banner Carousel
- Dynamic announcement and highlight banner carousel featuring upcoming hackathons, webinars, recruitment drives, and featured roadmaps.
- Includes auto-play, touch swipe, manual navigation controls, and contextual action buttons.

### 🎯 6. Career Goals
- Goal-setting module allowing students to define target roles (e.g., AI/ML Engineer, Full Stack Developer, Data Scientist).
- Benchmark comparison comparing user capabilities against role prerequisites.

### 🗺️ 7. Career Roadmap & Topic Explorer
- Visual, milestone-driven learning path with categorized stages (Beginner, Intermediate, Advanced).
- Interactive topic inspection modals detailing learning objectives, curated resources, and estimated completion times.
- Resume foundation milestones with downloadable templates and ATS alignment tips.

### 🤖 8. AI Career Chat UI
- Interactive AI career assistant simulating personalized conversational coaching.
- Quick prompt chips, contextual guidance, roadmap questions, and career exploration suggestions.

### 🧠 9. Skill Intelligence
- Visual skill breakdown using radar charts and comparative bar graphs.
- Highlights strengths, emerging skills, and missing competencies required for target roles.

### 🚀 10. Career Growth Hub
- Central hub for exploring career opportunities, internship listings, mentorship channels, and industry tracks.

### 📈 11. Progress Tracking & Readiness
- Holistic readiness scoring engine tracking completed topics, projects, and certifications.
- Detailed breakdown across Core Concepts, Practical Experience, and Interview Preparation.

### 🏛️ 12. College-Wise Events
- Filterable campus event portal listing workshops, placement drives, tech talks, and hackathons.
- Event bookmarking, registration handling, and calendar reminders.

### 🔔 13. Notifications Center
- Real-time notification drawer categorizing alerts into Announcements, Reminders, and Milestones.
- Mark as read, dismiss, and filter controls.

### ⚙️ 14. Settings
- User preferences including Theme switching (Dark/Light mode), notification toggles, account privacy, and session management.

### 🛡️ 15. Admin Login & Console
- Dedicated administrator authentication portal.
- Full Admin Management Console featuring user management, platform analytics, placement drive coordinators, content moderation, and banner management.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) |
| **Build Tool** | [Vite 5](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) & Vanilla CSS |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Charts** | [Recharts 3](https://recharts.org/) |
| **Effects** | [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) |
| **Linting** | [Oxlint](https://oxc.rs/) |

---

## 📁 Project Directory Structure

```text
ip1/
├── public/                     # Static assets & icons
├── src/
│   ├── assets/                 # SVGs, images, and branding assets
│   ├── components/
│   │   ├── admin/              # Admin dashboard, analytics, user management
│   │   ├── auth/               # Login, Signup, Admin Login, OTP, Forgot Password
│   │   ├── chat/               # AI Career Chat interface
│   │   ├── common/             # Navbar, Sidebar, Modals, Quick Actions, CircularProgress
│   │   ├── dashboard/          # Dashboard views, metric cards, Banner Carousel
│   │   ├── goals/              # Career Goals selection and benchmarks
│   │   ├── notifications/      # Notifications panel
│   │   ├── placementAdmin/     # Placement officer console and drive management
│   │   ├── profile/            # Student Profile components
│   │   ├── roadmap/            # Career Roadmap, Topic Details modal, Resume Foundation
│   │   ├── settings/           # App and account settings
│   │   ├── skills/             # Skill Intelligence, Growth Hub, Events, Progress Tracking
│   │   └── splash/             # Animated Splash Screen
│   ├── context/                # React Context providers (Auth, Theme, Career, Admin, Banner, Toast, Events)
│   ├── data/                   # Mock datasets, curriculum, and event listings
│   ├── utils/                  # Helper functions and utilities
│   ├── App.jsx                 # Core routing and application shell
│   ├── index.css               # Global styling, themes, and Tailwind directives
│   └── main.jsx                # Application root entry point
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # Tailwind theme and plugin configuration
└── vite.config.js              # Vite configuration (port 5199)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.x or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/draikar900-create/CareerPilot-AI.git
   cd CareerPilot-AI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:5199/
   ```

### Production Build
To create an optimized production build:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

---

## 🤝 Contribution & License

Developed as part of the CareerPilot AI project. All rights reserved.
