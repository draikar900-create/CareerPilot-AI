import React, { useState, useRef, useEffect } from 'react';
import { useCareer } from '../../context/CareerContext';
import { useProfile } from '../../context/ProfileContext';
import {
  MessageSquareCode,
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RefreshCw,
  FileCheck,
  Briefcase,
  Target,
  Code,
  TrendingUp,
  Info,
  Clock
} from 'lucide-react';

export default function AIChat() {
  const { currentRole } = useCareer();
  const { profile } = useProfile();

  const roleTitle = currentRole?.title || 'Software Engineering';
  const firstName = profile?.fullName?.trim() ? profile.fullName.trim().split(' ')[0] : 'Student';

  const placeholderMessage = 'AI Career Assistant will be available after backend integration.';

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: placeholderMessage,
      timestamp: 'Just now'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestionPrompts = [
    {
      icon: Target,
      label: 'Career Guidance',
      query: `Which career path suits my profile best?`
    },
    {
      icon: TrendingUp,
      label: 'Skill Gap Guidance',
      query: `What skills am I missing for ${roleTitle}?`
    },
    {
      icon: FileCheck,
      label: 'Resume Guidance',
      query: `How can I improve my resume for ${roleTitle}?`
    },
    {
      icon: Code,
      label: 'Interview Preparation',
      query: `What technical interview questions should I prepare for?`
    },
    {
      icon: Briefcase,
      label: 'Internship Guidance',
      query: `Am I ready for internships in ${roleTitle}?`
    }
  ];

  const handleSend = (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const aiReplyMessage = {
      id: Date.now() + 1,
      sender: 'ai',
      text: placeholderMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage, aiReplyMessage]);
    setInputText('');
  };

  const copyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: placeholderMessage,
        timestamp: 'Just now'
      }
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-8 flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      {/* Header Card */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-glow">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-slate-900 dark:text-white">
                CareerPilot AI Assistant
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Frontend Preview</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Career guidance workspace for {firstName} • Target: {roleTitle}
            </p>
          </div>
        </div>

        <button
          onClick={resetChat}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 self-end sm:self-auto"
          title="Reset Chat"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Integration Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center gap-3 text-xs text-indigo-900 dark:text-indigo-200 shrink-0">
        <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <span className="font-semibold">
          AI Career Assistant will be available after backend integration.
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 glass-card rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-white/10 overflow-y-auto space-y-4 shadow-inner">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isAi ? '' : 'flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${
                  isAi
                    ? 'bg-gradient-to-tr from-brand-600 to-indigo-600 text-white'
                    : 'bg-slate-800 text-white'
                }`}
              >
                {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[90%] sm:max-w-[80%] space-y-1.5 ${isAi ? 'text-left' : 'text-right'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isAi
                      ? 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-sm'
                      : 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-glow text-left'
                  }`}
                >
                  <div className="whitespace-pre-line">
                    {msg.text}
                  </div>
                </div>

                {/* Subtext and Copy */}
                {isAi && (
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 px-1">
                    <span>{msg.timestamp}</span>
                    <button
                      onClick={() => copyMessage(msg.id, msg.text)}
                      className="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
        {suggestionPrompts.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(item.query)}
              className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:bg-brand-50/50 dark:hover:bg-brand-950/20 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all shadow-sm shrink-0"
            >
              <Icon className="w-3.5 h-3.5 text-brand-500" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="glass-card rounded-2xl p-2 border border-slate-200/80 dark:border-white/10 flex items-center gap-2 shrink-0 shadow-lg"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="AI Career Assistant will be available after backend integration."
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white shadow-glow disabled:opacity-40 disabled:pointer-events-none hover:opacity-95 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
