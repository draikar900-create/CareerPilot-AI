import React, { useState } from 'react';
import { useCareer } from '../../context/CareerContext';
import { useProfile } from '../../context/ProfileContext';
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
  GraduationCap
} from 'lucide-react';

export default function CareerRoadmap({ setActiveTab }) {
  const {
    currentRole,
    currentRoadmap,
    roadmapStats,
    dailyStreak,
    toggleTopicCompletion
  } = useCareer();

  const { isFirstSemester } = useProfile();
  const [selectedTopic, setSelectedTopic] = useState(null);

  // If a topic is currently selected, render the Smart Learning Hub
  if (selectedTopic && currentRole) {
    const livePhase = currentRoadmap[selectedTopic.phaseIdx];
    const liveTopic = livePhase?.topics?.find(t => t.id === selectedTopic.id) || selectedTopic;

    return (
      <TopicLearningHub
        topic={liveTopic}
        phaseIdx={selectedTopic.phaseIdx}
        phaseSemester={selectedTopic.phaseSemester}
        onBack={() => setSelectedTopic(null)}
      />
    );
  }

  // If no career goal selected yet
  if (!currentRole) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-white/10 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            No Target Career Role Selected
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Select your dream job role in Career Goals to generate a personalized semester-wise roadmap.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('career-goals')}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow inline-flex items-center gap-2"
            >
              <span>Go To Career Goals</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-brand-500/15 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 flex items-center gap-1.5">
                <Milestone className="w-3.5 h-3.5" />
                Semester Learning Roadmap
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Target: {currentRole.title}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {currentRole.title} Curriculum
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Click any topic to open the complete <strong>Smart Learning Hub</strong> with hand-written PDF notes, curated YouTube masterclasses, practice questions, and course-specific capstone projects.
            </p>
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
                <span className="font-extrabold text-brand-600 dark:text-brand-400">{roadmapStats.percentage}%</span>
              </div>
              <div className="w-28 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-600 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${roadmapStats.percentage}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                {roadmapStats.completedTopics}/{roadmapStats.totalTopics} Topics Completed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SPECIAL SECTION FOR FIRST SEMESTER STUDENTS: Resume Foundation */}
      {isFirstSemester && (
        <div className="animate-fade-in">
          <ResumeFoundation />
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
          {currentRoadmap.map((phase, phaseIdx) => {
            const phaseCompletedCount = phase.topics.filter(t => t.completed).length;
            const isPhaseAllCompleted = phaseCompletedCount === phase.topics.length && phase.topics.length > 0;

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
                        {phase.semester}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {phase.estimatedDuration}
                        </span>
                        <span>•</span>
                        <span>{phaseCompletedCount} of {phase.topics.length} topics finished</span>
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

                {/* Topics in this phase -> Clicking opens TopicLearningHub */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {phase.topics.map((topic) => (
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
                          {topic.hours} hrs study
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
    </div>
  );
}
