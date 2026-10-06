import React, { useState } from 'react';
import { useCareer } from '../../context/CareerContext';
import { useProfile } from '../../context/ProfileContext';
import { getRoadmapForRole } from '../../data/mockData';
import ResumeFoundation from './ResumeFoundation';
import TopicLearningHub from './TopicLearningHub';
import {
  Milestone,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Sparkles,
  TrendingUp,
  Target,
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  RefreshCw,
  Award,
  Briefcase,
  Layers,
  AlertCircle,
  Calendar,
  CheckSquare
} from 'lucide-react';

export default function CareerRoadmap({ setActiveTab }) {
  const {
    currentRole,
    currentRoadmap,
    roadmapStats,
    dailyStreak,
    toggleTopicCompletion,
    dbRoadmap,
    isGeneratingRoadmap,
    regenerateAIRoadmap
  } = useCareer();

  const { isFirstSemester } = useProfile();
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Derive active structured roadmap data from backend database
  const structuredData = dbRoadmap?.structured_data || null;

  // Use database milestones if available, fallback to currentRoadmap or static role default
  const fallbackRoadmap = getRoadmapForRole(currentRole?.id || 'full-stack-dev');
  const phasesToRender = (structuredData?.milestones && Array.isArray(structuredData.milestones) && structuredData.milestones.length > 0)
    ? structuredData.milestones
    : (currentRoadmap && Array.isArray(currentRoadmap) && currentRoadmap.length > 0 ? currentRoadmap : fallbackRoadmap);

  // If a topic is currently selected, render the Smart Learning Hub
  if (selectedTopic) {
    const livePhase = phasesToRender[selectedTopic.phaseIdx];
    const liveTopic = (livePhase?.topics || []).find(t => t.id === selectedTopic.id) || selectedTopic;

    return (
      <TopicLearningHub
        topic={liveTopic}
        phaseIdx={selectedTopic.phaseIdx}
        phaseSemester={selectedTopic.phaseSemester || livePhase?.semester}
        onBack={() => setSelectedTopic(null)}
      />
    );
  }

  // Calculate overall stats from active phases
  let totalTopics = 0;
  let completedTopics = 0;
  (phasesToRender || []).forEach(phase => {
    (phase.topics || []).forEach(t => {
      totalTopics++;
      if (t.completed) completedTopics++;
    });
  });
  const overallPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-brand-500/15 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Personalized AI Roadmap
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Target: {currentRole?.title || structuredData?.careerOptions?.[0]?.role || 'Software Engineer'}
              </span>
              {dbRoadmap?.generated_at && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-400">
                  Grounded in Database Context
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {structuredData?.title || `${currentRole?.title || 'Software Engineering'} Roadmap`}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              {structuredData?.description || 'AI-curated learning pathway engineered from your verified academic records, assessment scores, and target role goals.'}
            </p>

            <div className="pt-2">
              <button
                onClick={() => regenerateAIRoadmap(currentRole?.title)}
                disabled={isGeneratingRoadmap}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingRoadmap ? 'animate-spin' : ''}`} />
                <span>{isGeneratingRoadmap ? 'Generating with AI...' : 'Regenerate AI Roadmap'}</span>
              </button>
            </div>
          </div>

          {/* Streaks & Progress widget */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shrink-0">
            {/* Daily Streak */}
            <div className="flex items-center gap-3 pr-4 border-r border-slate-200 dark:border-slate-800">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                <Flame className="w-6 h-6 fill-amber-500 animate-pulse" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Daily Streak</span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {dailyStreak} Days
                </span>
              </div>
            </div>

            {/* Overall Progress % */}
            <div className="pl-1">
              <div className="flex items-center justify-between gap-3 text-xs mb-1">
                <span className="text-slate-400 font-semibold">Progress</span>
                <span className="font-extrabold text-brand-600 dark:text-brand-400">{overallPercentage}%</span>
              </div>
              <div className="w-28 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-600 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                {completedTopics}/{totalTopics} Topics Completed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SPECIAL SECTION FOR FIRST SEMESTER STUDENTS */}
      {isFirstSemester && (
        <div className="animate-fade-in">
          <ResumeFoundation />
        </div>
      )}

      {/* AI BASELINE & CAREER RELEVANCE AUDIT */}
      {structuredData?.baseline && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Baseline Summary */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-500" />
              <span>Current Profile Baseline</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Assessed Level</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{structuredData.baseline.currentLevel}</span>
              </div>
              <div className="py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium block mb-1">Identified Strengths:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(structuredData.baseline.strengths || []).map((s, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="py-1.5">
                <span className="text-slate-400 font-medium block mb-1">Areas for Development:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(structuredData.baseline.weaknesses || []).map((w, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Career Direction Relevance Rationale */}
          {structuredData.careerOptions?.[0] && (
            <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                <span>Career Relevance Analysis</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                    Target Role: {structuredData.careerOptions[0].role} (Readiness: {structuredData.careerOptions[0].readiness})
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                    {structuredData.careerOptions[0].whyRelevant}
                  </p>
                </div>
                <div className="pt-1">
                  <span className="text-slate-400 font-medium block mb-1">Priority Missing Skills for Target Role:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(structuredData.careerOptions[0].missingSkills || []).map((m, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PRIORITIZED SKILL GAP AUDIT */}
      {structuredData?.skillGaps && structuredData.skillGaps.length > 0 && (
        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <span>Prioritized Skill Gap Audit</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {structuredData.skillGaps.map((gap, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{gap.skill}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    gap.priority === 'High'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}>
                    {gap.priority} Priority
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Current: {gap.currentLevel}</span>
                  <span>→</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">Target: {gap.targetLevel}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                  {gap.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Roadmap Phases Timeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-500" />
            <span>Curriculum Phases & Milestones</span>
          </h2>
          <button
            onClick={() => setActiveTab('career-goals')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>Switch Target Role</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Phase Cards */}
        <div className="space-y-4">
          {(phasesToRender || []).map((phase, phaseIdx) => {
            const phaseTopics = phase.topics || [];
            const phaseCompletedCount = phaseTopics.filter(t => t.completed).length;
            const isPhaseAllCompleted = phaseCompletedCount === phaseTopics.length && phaseTopics.length > 0;

            return (
              <div
                key={phaseIdx}
                className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 transition-all space-y-4"
              >
                {/* Phase Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isPhaseAllCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/30'
                      }`}
                    >
                      {isPhaseAllCompleted ? <Check className="w-5 h-5" /> : phaseIdx + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {phase.semester || `Phase ${phaseIdx + 1}`}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {phase.estimatedDuration || '4 Weeks'}
                        </span>
                        <span>•</span>
                        <span>{phaseCompletedCount} of {phaseTopics.length} topics finished</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto uppercase tracking-wider ${
                      isPhaseAllCompleted
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : phaseCompletedCount > 0
                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isPhaseAllCompleted ? 'Phase Mastered' : phaseCompletedCount > 0 ? 'In Progress' : 'Not Started'}
                  </span>
                </div>

                {/* Topics in this phase */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {phaseTopics.map((topic) => (
                    <div
                      key={topic.id}
                      onClick={() => setSelectedTopic({
                        ...topic,
                        phaseIdx,
                        phaseSemester: phase.semester
                      })}
                      className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex flex-col justify-between group hover:shadow-md ${
                        topic.completed
                          ? 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50'
                          : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800 hover:border-brand-500/50 hover:bg-brand-500/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-sm font-semibold leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors ${
                          topic.completed ? 'text-emerald-600 dark:text-emerald-400 line-through opacity-85' : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {topic.title}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTopicCompletion(phaseIdx, topic.id);
                          }}
                          className="shrink-0 mt-0.5 p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                          aria-label="Toggle completed"
                          title={topic.completed ? 'Mark uncompleted' : 'Mark completed'}
                        >
                          {topic.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-400 group-hover:text-brand-500 transition-colors" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-800/40">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {topic.hours || 10} hrs study
                        </span>

                        <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>Learning Hub</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECOMMENDED PRACTICAL PROJECTS & CERTIFICATIONS */}
      {structuredData?.recommendedProjects && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Projects */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-500" />
              <span>Recommended Practical Capstone Projects</span>
            </h3>
            <div className="space-y-3">
              {Array.isArray(structuredData?.recommendedProjects) && structuredData.recommendedProjects.length > 0 ? (
                structuredData.recommendedProjects.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{p?.title || 'Project'}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        {p?.difficulty || 'Intermediate'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">{p?.description || ''}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(Array.isArray(p?.technologies) ? p.technologies : []).map((tech, tIdx) => (
                        <span key={tIdx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No project recommendations available.</p>
              )}
            </div>
          </div>

          {/* Certifications & Placement Preparation */}
          <div className="space-y-4">
            {Array.isArray(structuredData?.recommendedCertifications) && structuredData.recommendedCertifications.length > 0 && (
              <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Recommended Industry Certifications</span>
                </h3>
                <div className="space-y-2 text-xs">
                  {structuredData.recommendedCertifications.map((cert, cIdx) => (
                    <div key={cIdx} className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{cert?.title || 'Certification'}</span>
                        <span className="text-slate-400 text-[11px]">{cert?.provider || 'Industry Partner'}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {cert?.priority || 'Medium'} Priority
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {structuredData.placementPrep && (
              <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-500" />
                  <span>Placement Preparation Focus</span>
                </h3>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">DSA Strategy</span>
                    <p className="text-xs">{structuredData.placementPrep.dsaStrategy}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-brand-500/5 border border-brand-500/20">
                    <span className="font-bold text-brand-600 dark:text-brand-400 block mb-1">Interview Prep & Resume</span>
                    <p className="text-xs">{structuredData.placementPrep.interviewFocus}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
