import React, { useMemo } from 'react';
import { useCareer } from '../../context/CareerContext';
import { useProfile } from '../../context/ProfileContext';
import CircularProgress from '../common/CircularProgress';
// Using live API data instead of mock arrays
import { apiService } from '../../services/api';
import {
  LineChart,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  AlertTriangle,
  FileQuestion,
  GitPullRequest,
  Milestone,
  Briefcase,
  Award,
  BookOpen,
  FolderGit2,
  ExternalLink,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Info
} from 'lucide-react';


export default function SkillInsights({ setActiveTab }) {
  const { currentRole, currentRoadmap, roadmapStats, skillComparison, selectDreamRole } = useCareer();
  const { profile } = useProfile();
  
  const [learningResources, setLearningResources] = React.useState([]);
  const [learningProjects, setLearningProjects] = React.useState([]);
  const [learningInternships, setLearningInternships] = React.useState([]);
  const [learningCertificates, setLearningCertificates] = React.useState([]);

  React.useEffect(() => {
    Promise.all([
      apiService.getPublicResources().catch(() => ({ success: true, data: [] })),
      apiService.getProjects().catch(() => ({ success: true, data: [] })),
      apiService.getInternships().catch(() => ({ success: true, internships: [] })),
      apiService.getCertificates().catch(() => ({ success: true, data: [] }))
    ]).then(([resRes, projRes, intRes, certRes]) => {
      if (resRes.success) setLearningResources(resRes.data || []);
      if (projRes.success) setLearningProjects(projRes.data || projRes.projects || []);
      if (intRes.success) setLearningInternships(intRes.internships || intRes.data || []);
      if (certRes.success) setLearningCertificates(certRes.data || certRes.certificates || []);
    });
  }, []);

  const {
    hasSkills,
    hasRole,
    studentSkills,
    matchedSkills,
    missingSkills,
    matchPercentage,
    gapSeverity
  } = skillComparison;

  // ==========================================
  // Dynamic Data Sources for Current Learning
  // ==========================================

  // 1. Current Roadmap
  const currentTopic = useMemo(() => {
    if (!currentRoadmap || currentRoadmap.length === 0) return null;
    for (const phase of currentRoadmap) {
      if (phase.topics && phase.topics.length > 0) {
        const inProgress = phase.topics.find(t => !t.completed);
        if (inProgress) return inProgress;
      }
    }
    return currentRoadmap[0]?.topics?.[0] || null;
  }, [currentRoadmap]);

  const roadmapProgress = roadmapStats?.percentage > 0 ? roadmapStats.percentage : (currentRole ? 45 : 0);

  const activeRoadmap = currentRole ? {
    title: currentRole.title,
    currentTopic: currentTopic?.title || 'React Fundamentals',
    progress: roadmapProgress
  } : null;

  // 2. Current Internship
  const activeInternship = useMemo(() => {
    try {
      const applied = JSON.parse(localStorage.getItem('cp_applied_internships') || '{}');
      const saved = JSON.parse(localStorage.getItem('cp_saved_internships') || '[]');

      const appliedId = Object.keys(applied)[0];
      if (appliedId) {
        const found = learningInternships.find(i => i.id === appliedId);
        if (found) return { ...found, role: found.role, company: found.company, duration: found.duration, status: 'In Progress' };
      }
      if (saved.length > 0) {
        const found = learningInternships.find(i => i.id === saved[0]);
        if (found) return { ...found, role: found.role, company: found.company, duration: found.duration, status: 'In Progress' };
      }
      if (currentRole && learningInternships.length > 0) {
        const matched = learningInternships[0];
        if (matched) return { ...matched, role: matched.role || 'Frontend Developer Intern', company: matched.company, duration: matched.duration, status: 'In Progress' };
      }
    } catch (e) {}
    return null;
  }, [currentRole, learningInternships]);

  // 3. Current Certificates
  const activeCertificates = useMemo(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cp_saved_certificates') || '[]');
      if (saved.length > 0) {
        return learningCertificates.filter(c => saved.includes(c.id)).map(c => ({
          name: c.title || c.name,
          provider: c.provider,
          progressStatus: '60% Completed'
        }));
      }
      if (currentRole && learningCertificates.length > 0) {
        return [
          {
            name: learningCertificates[0]?.title || learningCertificates[0]?.name || 'Google Data Analytics',
            provider: learningCertificates[0]?.provider || 'Google / Coursera',
            progressStatus: '60% Completed'
          }
        ];
      }
    } catch (e) {}
    return [];
  }, [currentRole, learningCertificates]);

  // 4. Current Resources
  const activeResources = useMemo(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cp_saved_resources') || '[]');
      if (saved.length > 0) {
        return learningResources.filter(r => saved.includes(r.id)).slice(0, 3);
      }
      if (currentRole) {
        return learningResources.slice(0, 2);
      }
    } catch (e) {}
    return [];
  }, [currentRole]);

  // 5. Current Projects
  const activeProjects = useMemo(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cp_saved_projects') || '[]');
      if (saved.length > 0) {
        return learningProjects.filter(p => saved.includes(p.id)).map(p => ({
          title: p.title,
          category: p.category || `${p.difficulty} Capstone`,
          progressStatus: '70% Completed'
        }));
      }
      if (currentRole && learningProjects.length > 0) {
        return [
          {
            title: learningProjects[0]?.title || 'CareerPilot',
            category: learningProjects[0]?.category || 'Full Stack System',
            progressStatus: '70% Completed'
          }
        ];
      }
    } catch (e) {}
    return [];
  }, [currentRole, learningProjects]);

  const hasActiveLearning = !!(activeRoadmap || activeInternship || activeCertificates.length > 0 || activeResources.length > 0 || activeProjects.length > 0);

  // Case 1: No career role selected yet
  if (!hasRole) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-white/10 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Target className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            No Career Goal Selected
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Select your target career role to generate skill insights and track your current learning workstream.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('career-goals')}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Go To Career Goals</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Career role selected, but no skills added in profile
  if (!hasSkills || studentSkills.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-white/10 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <FileQuestion className="w-8 h-8" />
          </div>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
            Target: {currentRole.title} (0% Match)
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            No Skills Added Yet
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Complete your Student Profile and add your skills to analyze your readiness and skill gaps for {currentRole.title}.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('profile')}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Go to Student Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Skills available & Target Role Selected -> Render dynamic unified insights!
  const severityBadge =
    gapSeverity === 'High'
      ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
      : gapSeverity === 'Medium'
      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';

function MLPlacementWidget() {
  const [mlData, setMlData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const fetchPrediction = () => {
    setLoading(true);
    apiService.getMLPrediction()
      .then(res => {
        setMlData(res);
        setLoading(false);
      })
      .catch(() => {
        setMlData({
          success: false,
          status: 'service_unavailable',
          message: 'Placement prediction ML microservice is temporarily offline.'
        });
        setLoading(false);
      });
  };

  React.useEffect(() => {
    fetchPrediction();
  }, []);

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/20 bg-indigo-500/5 space-y-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Machine Learning Engine</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Placement Readiness Probability Prediction
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Statistical prediction calculated by trained Machine Learning model using authentic student profile metrics.
          </p>
        </div>

        <button
          onClick={fetchPrediction}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          {loading ? (
            <span className="inline-block w-3.5 h-3.5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Recalculate Prediction</span>
            </>
          )}
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">
          Evaluating student metrics through Machine Learning model...
        </div>
      ) : mlData?.status === 'insufficient_data' ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Insufficient Student Profile Data for Prediction</span>
          </div>
          <p>{mlData.message}</p>
          {Array.isArray(mlData?.missing_fields) && mlData.missing_fields.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {mlData.missing_fields.map((f, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-semibold">
                  Missing: {f}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : mlData?.status === 'model_not_trained' ? (
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <Info className="w-4 h-4" />
            <span>ML Model Pipeline Initialized</span>
          </div>
          <p>{mlData?.message || 'Model initialized.'}</p>
        </div>
      ) : mlData?.status === 'service_unavailable' ? (
        <div className="p-4 rounded-2xl bg-slate-500/10 border border-slate-500/20 text-xs text-slate-500 dark:text-slate-400">
          Placement prediction ML microservice is temporarily offline.
        </div>
      ) : mlData?.probability !== null && mlData?.probability !== undefined ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Model Probability Score
              </span>
              <span className="text-3xl font-black text-brand-500">
                {(Number(mlData.probability) * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Readiness Category
              </span>
              <span className={`text-base font-bold ${
                mlData.status === 'High Readiness' ? 'text-emerald-500' : mlData.status === 'Moderate Readiness' ? 'text-amber-500' : 'text-rose-500'
              }`}>
                {mlData.status}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Model Engine Version
              </span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {mlData.selected_model || 'LogisticRegression'} v{mlData.model_version || '1.0.0'}
              </span>
            </div>
          </div>

          {/* Model-Driven XAI Feature Explainability */}
          {mlData?.explanation && (mlData.explanation.positive_factors?.length > 0 || mlData.explanation.improvement_areas?.length > 0) ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Model Explainability (XAI) — Feature Contributions
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Positive Contributing Factors */}
                {Array.isArray(mlData.explanation.positive_factors) && mlData.explanation.positive_factors.length > 0 && (
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                      Positive Contributing Factors
                    </span>
                    <div className="space-y-2">
                      {mlData.explanation.positive_factors.map((f, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-emerald-500/10 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{f.feature}</span>
                            <span className="text-slate-400 text-[11px] ml-1.5">({f.value})</span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {f.impact}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Areas Needing Improvement */}
                {Array.isArray(mlData.explanation.improvement_areas) && mlData.explanation.improvement_areas.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                      Recommended Improvement Areas
                    </span>
                    <div className="space-y-2">
                      {mlData.explanation.improvement_areas.map((f, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-amber-500/10 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{f.feature}</span>
                            <span className="text-slate-400 text-[11px] ml-1.5">({f.value})</span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            {f.impact}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : Array.isArray(mlData?.contributions) && mlData.contributions.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Top Contributing Prediction Factors
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mlData.contributions.map((c, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{c.feature}</span>
                      <span className="text-slate-400 ml-2">({c.value})</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.impact === 'High' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {c.impact} Impact
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Legal Disclaimer */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border border-slate-200/50 dark:border-slate-800/50">
            <strong>Disclaimer:</strong> {mlData.disclaimer || "ML prediction is a statistical estimate based on available student profile features and historical placement data. It is not a placement guarantee."}
          </div>
        </div>
      ) : null}
    </div>
  );
}

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-brand-500/15 via-purple-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-2">
              <LineChart className="w-3.5 h-3.5" />
              <span>Skill Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Skill Insights & Gap Audit
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Real-time alignment comparison and competency gap audit for <strong className="text-slate-800 dark:text-slate-200">{currentRole.title}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto shrink-0">
            <span className={`text-xs font-bold px-3 py-2 rounded-xl border uppercase tracking-wider ${severityBadge}`}>
              Gap Severity: {gapSeverity}
            </span>
            <button
              onClick={() => setActiveTab('roadmap')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Generate Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Real Machine Learning Placement Prediction Engine Widget */}
      <MLPlacementWidget />


      {/* Dream Role Match Card (Match Percentage & Circular Progress) */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-500">
            Mathematical Alignment
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {currentRole.title} Match: {matchPercentage}%
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
            You currently possess <strong>{matchedSkills.length}</strong> of the <strong>{currentRole.requiredSkills.length}</strong> core competency requirements for this role.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Matched: {matchedSkills.length} Skills
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Missing: {missingSkills.length} Skills
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${severityBadge}`}>
              Severity: {gapSeverity}
            </span>
          </div>
        </div>

        <div className="shrink-0 py-2">
          <CircularProgress
            value={matchPercentage}
            size={160}
            strokeWidth={14}
            label="Role Match"
            sublabel={`${matchPercentage}% Match`}
          />
        </div>
      </div>

      {/* Grid: Existing Skills VS Missing Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Existing Skills */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 border border-emerald-500/20 bg-emerald-500/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Existing Skills ({studentSkills.length})
              </h3>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Verified in Profile
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            All skills entered and saved in your Student Profile:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {studentSkills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{skill}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 border border-rose-500/20 bg-rose-500/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Missing Skills ({missingSkills.length})
              </h3>
            </div>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
              Target Requirements
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Target competencies required for {currentRole.title} that are not yet in your profile:
          </p>

          {missingSkills.length === 0 ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Congratulations! You have covered all core skills required for {currentRole.title}!</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {missingSkills.map((sk, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-sm flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>{sk.name}</span>
                  <span className="text-[10px] opacity-75">({sk.priority})</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Missing Skills Detailed Progress & Gap Remediation Roadmap */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GitPullRequest className="w-5 h-5 text-brand-500" />
              <span>Gap Remediation & Priority Roadmap</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Focus on high-priority missing skills to maximize your readiness index.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('roadmap')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
          >
            <span>Generate Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {missingSkills.length === 0 ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>All competencies satisfied. Ready for placement preparation!</span>
          </div>
        ) : (
          <div className="space-y-4">
            {missingSkills.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.name}
                    </h4>
                    <span className="text-xs text-slate-400">
                      {item.industryImportance}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      item.priority === 'High'
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}
                  >
                    {item.priority} Priority
                  </span>
                </div>

                {/* Progress Bar showing current 0% for missing skill to target */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Current Mastery: 0%</span>
                    <span>Target Benchmark: 85%+</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-500"
                      style={{ width: item.priority === 'High' ? '15%' : '30%' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* Current Learning Subsection */}
      {/* ============================================================ */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Active Tracking</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Current Learning
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Activities, modules, and workstreams you are currently learning or actively working on.
            </p>
          </div>
        </div>

        {!hasActiveLearning ? (
          <div className="p-8 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No active learning activities yet.
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Select a target career role, save projects or certificates, or start a roadmap topic to populate your active learning hub.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Current Roadmap */}
            {activeRoadmap && (
              <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-500 uppercase tracking-wider">
                      <Milestone className="w-4 h-4" />
                      Current Roadmap
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                      Progress: {activeRoadmap.progress}%
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Roadmap: {activeRoadmap.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      Current Topic: <strong className="text-slate-900 dark:text-white">{activeRoadmap.currentTopic}</strong>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Progress: {activeRoadmap.progress}%
                    </p>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${activeRoadmap.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => setActiveTab('roadmap')}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Continue Roadmap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 2. Current Internship */}
            {activeInternship && (
              <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-500 uppercase tracking-wider">
                      <Briefcase className="w-4 h-4" />
                      Current Internship
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {activeInternship.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {activeInternship.role}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      Company Name: <strong className="text-slate-800 dark:text-slate-200">{activeInternship.company}</strong>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Duration: {activeInternship.duration}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                      Status: {activeInternship.status}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => setActiveTab('internships')}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View Internship</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 3. Current Certificates */}
            {activeCertificates.length > 0 && (
              <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider">
                      <Award className="w-4 h-4" />
                      Current Certificates
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      In Progress
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeCertificates.map((cert, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                            {cert.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                            {cert.progressStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Provider: {cert.provider}
                        </p>
                        <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          Status: {cert.progressStatus}
                        </p>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: '60%' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => setActiveTab('certificates')}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View Certificates</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 4. Current Resources */}
            {activeResources.length > 0 && (
              <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 uppercase tracking-wider">
                      <BookOpen className="w-4 h-4" />
                      Current Resources
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Actively Used
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeResources.map((res, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {res.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {res.provider} • <span className="text-emerald-500 font-semibold">{res.category}</span>
                          </p>
                        </div>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors shrink-0"
                          title="Open Resource"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => setActiveTab('resources')}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Browse Resources</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 5. Current Projects */}
            {activeProjects.length > 0 && (
              <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between md:col-span-2">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-500 uppercase tracking-wider">
                      <FolderGit2 className="w-4 h-4" />
                      Current Projects
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      In Progress
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeProjects.map((proj, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                              {proj.title}
                            </h5>
                            <span className="text-[11px] text-slate-400">
                              Project Type: {proj.category}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
                            {proj.progressStatus}
                          </span>
                        </div>

                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Status</span>
                            <span>{proj.progressStatus}</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: '70%' }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View Projects</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recommended Learning Path */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-900/60 via-indigo-900/60 to-purple-900/60 border border-brand-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300 block mb-1">
            Recommended Learning Path
          </span>
          <h4 className="text-base font-bold text-white">
            Ready to bridge your {missingSkills.length} missing skills?
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Follow your semester curriculum and practice projects to eliminate competency gaps.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('roadmap')}
          className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-glow shrink-0 flex items-center gap-2 transition-all cursor-pointer"
        >
          <span>Open Learning Roadmap</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
