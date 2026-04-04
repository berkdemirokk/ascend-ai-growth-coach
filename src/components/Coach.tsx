import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, ArrowRight, Bot, CheckCircle2, Crown, Lightbulb, MessageSquare, RefreshCw, Sparkles } from 'lucide-react';
import { DailyTask, UserProfile } from '../types';
import { cn } from '../lib/utils';
import { playSound } from '../lib/sounds';
import { generateStructuredCoaching } from '../services/aiService';
import { buildUserStateSignature } from '../lib/summarySignature';
import { AI_RUNTIME } from '../lib/runtime';

interface CoachProps {
  profile: UserProfile;
  tasks: DailyTask[];
}

export default function Coach({ profile, tasks }: CoachProps) {
  const [coaching, setCoaching] = useState<{ well: string; slipped: string; next: string; recommendation: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reflection, setReflection] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestVersionRef = useRef(0);

  const summarySignature = useMemo(() => buildUserStateSignature(profile, tasks), [profile, tasks]);

  const loadCoaching = async () => {
    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await generateStructuredCoaching(profile, tasks);
      if (requestVersion !== requestVersionRef.current) {
        return;
      }
      setCoaching(data);
    } catch (error) {
      if (requestVersion !== requestVersionRef.current) {
        return;
      }
      console.error('Coach load error:', error);
      setErrorMessage('Koçluk özeti hazırlanamadı. Lütfen birazdan tekrar dene.');
    } finally {
      if (requestVersion !== requestVersionRef.current) {
        return;
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoaching();
  }, [summarySignature]);

  useEffect(() => () => {
    requestVersionRef.current += 1;
  }, []);

  const handleReflectionSubmit = () => {
    if (!reflection.trim()) {
      return;
    }

    playSound('success');
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-24">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-duo-blue to-duo-blue-dark flex items-center justify-center text-white shadow-xl">
            <Bot size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              Ascend Rehber
              {profile.isPremium && <Crown size={16} className="text-premium-gold" />}
            </h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Günlük strateji</p>
          </div>
        </div>
        <button onClick={loadCoaching} disabled={isLoading} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-duo-blue transition-all">
          <RefreshCw size={20} className={cn(isLoading && 'animate-spin')} />
        </button>
      </header>

      {errorMessage && <div className="rounded-[2rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{errorMessage}</div>}

      {AI_RUNTIME.usesPreviewFallback && (
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Güvenli AI koçluk sunucusu bağlı değil. Bu özet yerel önizleme mantığıyla hazırlanıyor.
        </div>
      )}

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-32 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-[6px] border-slate-100 dark:border-slate-800 border-t-duo-blue rounded-full animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-duo-blue animate-pulse" size={32} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse text-center">Strateji hazırlanıyor</p>
          </motion.div>
        ) : coaching ? (
          <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 gap-4">
              <div className="p-6 bg-white dark:bg-slate-800/40 rounded-[2rem] border-2 border-slate-50 dark:border-slate-700/50 shadow-xl space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 text-duo-green opacity-5 group-hover:opacity-10 transition-opacity">
                  <CheckCircle2 size={60} />
                </div>
                <div className="flex items-center gap-3 text-duo-green">
                  <CheckCircle2 size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neyi iyi yaptın?</span>
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-bold leading-relaxed relative z-10">{coaching.well}</p>
              </div>

              <div className="p-6 bg-white dark:bg-slate-800/40 rounded-[2rem] border-2 border-slate-50 dark:border-slate-700/50 shadow-xl space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 text-duo-orange opacity-5 group-hover:opacity-10 transition-opacity">
                  <AlertCircle size={60} />
                </div>
                <div className="flex items-center gap-3 text-duo-orange">
                  <AlertCircle size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Nerede zorlandın?</span>
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-bold leading-relaxed relative z-10">{coaching.slipped}</p>
              </div>

              <div className="p-6 bg-slate-900 rounded-[2rem] text-white shadow-2xl space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 text-white opacity-5 group-hover:opacity-10 transition-opacity">
                  <ArrowRight size={60} />
                </div>
                <div className="flex items-center gap-3 text-duo-blue">
                  <ArrowRight size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Sıradaki adım</span>
                </div>
                <p className="text-slate-200 font-bold leading-relaxed relative z-10">{coaching.next}</p>
              </div>

              <div className="p-6 bg-premium-gold/10 rounded-[2rem] border-2 border-premium-gold/20 shadow-xl space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 text-premium-gold opacity-5 group-hover:opacity-10 transition-opacity">
                  <Lightbulb size={60} />
                </div>
                <div className="flex items-center gap-3 text-premium-gold">
                  <Lightbulb size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Özel tavsiye</span>
                </div>
                <p className="text-slate-800 dark:text-slate-100 font-bold leading-relaxed relative z-10">{coaching.recommendation}</p>
              </div>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-duo-blue shadow-sm">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">Günlük yansıma</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Bugün öğrendiğin en önemli şey neydi?</p>
                </div>
              </div>

              {!isSubmitted ? (
                <div className="space-y-4">
                  <textarea
                    value={reflection}
                    onChange={(event) => setReflection(event.target.value)}
                    placeholder="Düşüncelerini buraya yaz..."
                    className="w-full h-32 p-6 bg-white dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-3xl outline-none focus:border-duo-blue transition-all font-bold text-slate-700 dark:text-slate-200 resize-none"
                  />
                  <button onClick={handleReflectionSubmit} disabled={!reflection.trim()} className="w-full py-5 bg-duo-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-duo-blue/20 disabled:opacity-50">
                    Yansımayı kaydet
                  </button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 bg-duo-green/10 rounded-3xl border-2 border-duo-green/20 text-center space-y-4">
                  <div className="w-12 h-12 bg-duo-green text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle2 size={24} />
                  </div>
                  <p className="text-duo-green-dark dark:text-duo-green font-black text-sm uppercase tracking-widest">Yansıma kaydedildi</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">Bu farkındalık bir sonraki günün kalitesini yükseltir.</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
