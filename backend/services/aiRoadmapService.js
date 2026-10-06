import dotenv from 'dotenv';
import { supabaseAdmin } from '../config/supabase.js';
import AIProviderFactory from './aiProviderService.js';

dotenv.config();

/**
 * AI Roadmap Service
 * Generates personalized, validated career roadmaps based on authentic student database context.
 */
export async function buildStudentCareerContext(userId) {
  const [
    { data: profile },
    { data: goal },
    { data: skills },
    { data: readinessAttempts },
    { data: savedProjects },
    { data: savedCertificates },
    { data: prediction },
    { data: dbResources }
  ] = await Promise.all([
    supabaseAdmin.from('student_profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabaseAdmin.from('career_goals').select('*').eq('user_id', userId).eq('status', 'active').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
    supabaseAdmin.from('student_skills').select('*').eq('user_id', userId),
    supabaseAdmin.from('readiness_attempts').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabaseAdmin.from('saved_projects').select('*, projects(*)').eq('user_id', userId),
    supabaseAdmin.from('saved_certificates').select('*, certificates(*)').eq('user_id', userId),
    supabaseAdmin.from('placement_predictions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabaseAdmin.from('resources').select('*').limit(20)
  ]);

  const latestAttempt = readinessAttempts && readinessAttempts.length > 0 ? readinessAttempts[0] : null;

  // Determine Rank based on Phase 4 score
  let rank = 'Unranked';
  if (latestAttempt) {
    if (latestAttempt.score >= 80) rank = 'Platinum';
    else if (latestAttempt.score >= 60) rank = 'Gold';
    else rank = 'Silver';
  }

  const acquiredSkills = (skills || []).map(s => `${s.skill_name} (${s.proficiency || 'Intermediate'})`);
  const profileSkills = profile?.technical_skills || [];
  const combinedSkills = Array.from(new Set([...acquiredSkills, ...profileSkills]));

  const completedProjects = (savedProjects || [])
    .filter(p => p.status === 'completed' || p.status === 'in_progress')
    .map(p => p.projects?.title || 'Custom Student Project');

  const earnedCertificates = (savedCertificates || [])
    .filter(c => c.status === 'completed')
    .map(c => c.certificates?.title || 'Certification');

  return {
    profile: {
      fullName: profile?.full_name || 'Student',
      branch: profile?.branch || 'Computer Science / Engineering',
      semester: profile?.semester || 5,
      college: profile?.college_name || 'Engineering College',
      cgpa: profile?.cgpa || 7.5,
      githubUrl: profile?.github_url || null,
      linkedinUrl: profile?.linkedin_url || null,
    },
    goal: {
      targetRole: goal?.target_role || 'Full Stack Engineer',
      targetCompany: goal?.target_company || 'Top Tech Product Companies',
      targetTimeline: goal?.target_timeline || '6 Months',
      focusSkills: goal?.focus_skills || ['Software Architecture', 'Full Stack Development']
    },
    skills: combinedSkills,
    assessment: {
      taken: !!latestAttempt,
      score: latestAttempt ? Math.round(latestAttempt.score) : null,
      rank,
      correctCount: latestAttempt?.correct_count || null,
      totalQuestions: latestAttempt?.total_questions || null
    },
    projects: completedProjects,
    certificates: earnedCertificates,
    placementPrediction: prediction ? {
      probability: Math.round((prediction.placement_probability || 0) * 100),
      tier: prediction.readiness_tier || 'Medium Risk'
    } : null,
    dbResources: (dbResources || []).map(r => ({ id: r.id, title: r.title, category: r.category, url: r.url }))
  };
}

export async function generatePersonalizedRoadmap(userId, targetRoleOverride = null) {
  const context = await buildStudentCareerContext(userId);
  const targetRole = targetRoleOverride || context.goal.targetRole || 'Full Stack Engineer';

  const systemPrompt = `You are CareerPilot AI, an elite AI career counselor and technical roadmap architect for engineering students.
Your task is to analyze the student's authentic database profile and output a STRICT JSON object representing a highly personalized 4-phase learning roadmap for the target role: "${targetRole}".

STUDENT AUTHENTIC PROFILE CONTEXT:
- Name: ${context.profile.fullName}
- Branch: ${context.profile.branch} (Semester ${context.profile.semester}, CGPA ${context.profile.cgpa})
- College: ${context.profile.college}
- Target Role: ${targetRole}
- Target Company Tier: ${context.goal.targetCompany}
- Current Skills: ${context.skills.length > 0 ? context.skills.join(', ') : 'Basic Programming'}
- Assessment Rank: ${context.assessment.rank} (${context.assessment.score !== null ? context.assessment.score + '%' : 'Assessment Pending'})
- Completed Projects: ${context.projects.length > 0 ? context.projects.join(', ') : 'None documented'}
- Certifications: ${context.certificates.length > 0 ? context.certificates.join(', ') : 'None documented'}
- Placement ML Prediction: ${context.placementPrediction ? context.placementPrediction.probability + '% (' + context.placementPrediction.tier + ')' : 'Not calculated'}

REQUIREMENTS FOR JSON OUTPUT:
You MUST respond with ONLY a valid JSON object (no raw text outside JSON).
Do NOT include markdown formatting wrappers like \`\`\`json. Output plain valid JSON matching this schema:

{
  "title": "${targetRole} Personal Mastery Roadmap",
  "description": "Custom AI-curated learning pathway engineered specifically for ${context.profile.fullName} based on your semester ${context.profile.semester} academic standing, ${context.assessment.rank} rank, and target goal of ${targetRole}.",
  "baseline": {
    "currentLevel": "Intermediate / Advanced / Foundation",
    "strengths": ["string"],
    "weaknesses": ["string"],
    "readinessScore": 75
  },
  "careerOptions": [
    {
      "role": "${targetRole}",
      "whyRelevant": "Detailed rationale explaining WHY this role fits the student's skills and branch.",
      "readiness": "High / Medium / Foundation",
      "missingSkills": ["string"]
    }
  ],
  "skillGaps": [
    {
      "skill": "string",
      "currentLevel": "Beginner / Intermediate",
      "targetLevel": "Advanced / Expert",
      "priority": "High / Medium / Low",
      "reason": "Rationale why this gap matters for ${targetRole}."
    }
  ],
  "milestones": [
    {
      "phaseNumber": 1,
      "semester": "Phase 1: Foundations & Core Mastery",
      "estimatedDuration": "4-6 Weeks",
      "topics": [
        {
          "id": "p1_t1",
          "title": "string",
          "description": "string",
          "hours": 12,
          "priority": "High",
          "completed": false,
          "resources": [
            {
              "title": "string",
              "url": "https://developer.mozilla.org",
              "type": "documentation"
            }
          ]
        }
      ]
    },
    {
      "phaseNumber": 2,
      "semester": "Phase 2: Deep Dive & Capstone Build",
      "estimatedDuration": "6-8 Weeks",
      "topics": []
    },
    {
      "phaseNumber": 3,
      "semester": "Phase 3: Advanced Systems & Portfolio Polish",
      "estimatedDuration": "6-8 Weeks",
      "topics": []
    },
    {
      "phaseNumber": 4,
      "semester": "Phase 4: Placement Readiness & Interview Mastery",
      "estimatedDuration": "4 Weeks",
      "topics": []
    }
  ],
  "recommendedProjects": [
    {
      "title": "string",
      "description": "string",
      "technologies": ["string"],
      "difficulty": "Intermediate / Advanced",
      "reason": "Tailored project to plug identified skill gaps."
    }
  ],
  "recommendedCertifications": [
    {
      "title": "string",
      "provider": "AWS / Google / Meta",
      "priority": "High / Medium"
    }
  ],
  "placementPrep": {
    "dsaStrategy": "string",
    "interviewFocus": "string",
    "resumeAdvice": "string"
  },
  "timeline": [
    {
      "stage": "Next 2–4 Weeks",
      "focus": "string"
    },
    {
      "stage": "1–3 Months",
      "focus": "string"
    },
    {
      "stage": "3–6 Months",
      "focus": "string"
    }
  ]
}

Ensure all milestones have at least 2-3 specific topics, realistic hour estimates, valid real resource URLs (like MDN, GitHub, official docs, W3Schools, or LeetCode - NEVER fake URLs), and clear priorities.`;

  let structuredData = null;

  try {
    const provider = AIProviderFactory.getProvider();
    const rawResult = await provider.generateStructured({
      systemPrompt,
      userMessage: `Generate structured personalized AI roadmap for ${context.profile.fullName || 'student'} aiming for ${targetRole}.`,
      temperature: 0.4
    });

    if (rawResult && typeof rawResult === 'object') {
      structuredData = parseAndValidateJSON(JSON.stringify(rawResult));
    }
  } catch (err) {
    console.warn('[AI Roadmap Service] Provider structured generation notice:', err.message);
  }

  if (!structuredData) {
    // Generate deterministic fallback roadmap grounded entirely in authentic student context
    structuredData = generateGroundedFallbackRoadmap(context, targetRole);
  }

  // Cross-reference and inject real DB resources into milestone topics where categories match
  if (context.dbResources && context.dbResources.length > 0 && structuredData.milestones) {
    structuredData.milestones.forEach((m) => {
      m.topics?.forEach((t) => {
        const matched = context.dbResources.find(r => 
          r.title.toLowerCase().includes(t.title.toLowerCase()) || 
          t.title.toLowerCase().includes(r.category.toLowerCase())
        );
        if (matched) {
          t.resources = t.resources || [];
          if (!t.resources.some(r => r.url === matched.url)) {
            t.resources.unshift({
              title: matched.title,
              url: matched.url,
              type: 'course'
            });
          }
        }
      });
    });
  }

  return structuredData;
}

function parseAndValidateJSON(text) {
  try {
    let cleanText = text.trim();
    // Strip markdown code fences if present
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    }
    const data = JSON.parse(cleanText);

    // Schema Validation Check
    if (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.milestones) &&
      data.milestones.length > 0
    ) {
      return data;
    }
  } catch (e) {
    console.error('Failed to parse AI JSON response:', e.message);
  }
  return null;
}

function generateGroundedFallbackRoadmap(context, targetRole) {
  const currentSkills = context.skills.length > 0 ? context.skills : ['Programming Fundamentals', 'Git'];

  return {
    title: `${targetRole} Personal Mastery Roadmap`,
    description: `Structured personalized roadmap for ${context.profile.fullName} based on semester ${context.profile.semester} academic performance and target goal of ${targetRole}.`,
    baseline: {
      currentLevel: context.assessment.rank !== 'Unranked' ? `${context.assessment.rank} Rank` : 'Foundation',
      strengths: currentSkills.slice(0, 3),
      weaknesses: ['Advanced System Design', 'Production Deployment'],
      readinessScore: context.assessment.score || 65
    },
    careerOptions: [
      {
        role: targetRole,
        whyRelevant: `Aligns with your ${context.profile.branch} branch coursework and current target career goal.`,
        readiness: context.assessment.score >= 70 ? 'High' : 'Medium',
        missingSkills: ['System Design', 'Cloud Deployment', 'Performance Optimization']
      }
    ],
    skillGaps: [
      {
        skill: 'Data Structures & Algorithms',
        currentLevel: 'Intermediate',
        targetLevel: 'Advanced',
        priority: 'High',
        reason: 'Essential for technical screening rounds at top tech product companies.'
      },
      {
        skill: 'System Design & Architecture',
        currentLevel: 'Beginner',
        targetLevel: 'Intermediate',
        priority: 'High',
        reason: 'Required for scalable full-stack application development.'
      }
    ],
    milestones: [
      {
        phaseNumber: 1,
        semester: 'Phase 1: Foundations & Core Engineering',
        estimatedDuration: '4 Weeks',
        topics: [
          {
            id: 'p1_t1',
            title: 'Algorithmic Problem Solving & DSA',
            description: 'Master arrays, trees, dynamic programming, and time complexity tradeoffs.',
            hours: 15,
            priority: 'High',
            completed: false,
            resources: [
              { title: 'LeetCode Problem Sets', url: 'https://leetcode.com', type: 'practice' },
              { title: 'GeeksforGeeks DSA Guide', url: 'https://www.geeksforgeeks.org/data-structures/', type: 'documentation' }
            ]
          },
          {
            id: 'p1_t2',
            title: 'Modern Software Engineering & Git Workflow',
            description: 'Version control, branching strategies, and CI/CD basics.',
            hours: 10,
            priority: 'High',
            completed: false,
            resources: [
              { title: 'Official Git Documentation', url: 'https://git-scm.com/doc', type: 'documentation' }
            ]
          }
        ]
      },
      {
        phaseNumber: 2,
        semester: 'Phase 2: Domain Mastery & Full-Stack Capstone',
        estimatedDuration: '6 Weeks',
        topics: [
          {
            id: 'p2_t1',
            title: 'Scalable API Development & Database Design',
            description: 'RESTful architecture, indexing, transaction boundaries, and query optimization.',
            hours: 20,
            priority: 'High',
            completed: false,
            resources: [
              { title: 'MDN Web Docs - Express & Node', url: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs', type: 'documentation' }
            ]
          }
        ]
      },
      {
        phaseNumber: 3,
        semester: 'Phase 3: System Architecture & Cloud Infrastructure',
        estimatedDuration: '6 Weeks',
        topics: [
          {
            id: 'p3_t1',
            title: 'Microservices, Caching & Containerization',
            description: 'Docker, Redis caching, message queues, and load balancing.',
            hours: 18,
            priority: 'Medium',
            completed: false,
            resources: [
              { title: 'Docker Official Getting Started', url: 'https://docs.docker.com/get-started/', type: 'documentation' }
            ]
          }
        ]
      },
      {
        phaseNumber: 4,
        semester: 'Phase 4: Placement Readiness & Mock Interviews',
        estimatedDuration: '4 Weeks',
        topics: [
          {
            id: 'p4_t1',
            title: 'Technical Mock Interviews & Portfolio Refinement',
            description: 'System design interviews, behavioral STAR method, and resume optimization.',
            hours: 12,
            priority: 'High',
            completed: false,
            resources: [
              { title: 'Tech Interview Handbook', url: 'https://www.techinterviewhandbook.org/', type: 'documentation' }
            ]
          }
        ]
      }
    ],
    recommendedProjects: [
      {
        title: 'Full-Stack Scalable Platform Capstone',
        description: 'Build a production-grade application featuring authentication, caching, background workers, and CI/CD.',
        technologies: ['Node.js', 'React', 'PostgreSQL', 'Redis'],
        difficulty: 'Advanced',
        reason: 'Demonstrates end-to-end engineering mastery for placement recruiters.'
      }
    ],
    recommendedCertifications: [
      {
        title: 'AWS Certified Cloud Practitioner or Developer',
        provider: 'Amazon Web Services',
        priority: 'High'
      }
    ],
    placementPrep: {
      dsaStrategy: 'Solve 2-3 medium LC problems daily focusing on Graphs, Trees, and Dynamic Programming.',
      interviewFocus: 'Prepare system design trade-offs and clear STAR format behavioral responses.',
      resumeAdvice: 'Highlight measurable impact (e.g. reduced latency by 30%) for every project.'
    },
    timeline: [
      { stage: 'Next 2–4 Weeks', focus: 'Master core algorithmic patterns & complete Phase 1 topics.' },
      { stage: '1–3 Months', focus: 'Build capstone project and strengthen system design skills.' },
      { stage: '3–6 Months', focus: 'Take technical mock interviews & apply for placement drives.' }
    ]
  };
}
