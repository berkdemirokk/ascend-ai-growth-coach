import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Quote, RefreshCw, Sparkles, Star, Zap } from 'lucide-react';
import { UserProfile, DailyTask } from '../types';
import { generateEvolutionInsight } from '../services/evolutionService';
import { cn } from '../lib/utils';
import { buildUserStateSignature } from '../lib/summarySignature';
import { AI_RUNTIME } from '../lib/runtime';

interface EvolutionPanelProps {
  profile: UserProfile;
  tasks: DailyTask[];
}

export default function EvolutionPanel({ profile, tasks }: EvolutionPanelProps) {
  const [insight, setInsight] = useState<{ analysis: string; secretMission: string; quote: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestVersionRef = useRef(0);

  const summarySignature = useMemo(() => buildUserStateSignature(profile, tasks), [profile, tasks]);

  const loadEvolution = async () => {
    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextInsight = await generateEvolutionInsight(profile, tasks);
      if (requestVersion !== requestVersionRef.current) {
        return;
      }
      setInsight(nextInsight);
    } catch (error) {
      if (requestVersion !== requestVersionRef.current) {
        return;
      }
      console.error('Evolution load error:', error);
      setErrorMessage('Gelişim özeti şu an üretilemedi. Lütfen birazdan tekrar dene.');
    } finally {
      if (requestVersion !== requestVersionRef.current) {
        return;
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvolution();
  }, [summarySignature]);

  useEffect(() => () => {
    requestVersionRef.current += 1;
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Gelişim raporu</h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Derin ilerleme özeti</p>
        </div>
        <button onClick={loadEvolution} disabled={isLoading} className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-duo-blue transition-all shadow-sm border border-slate-100 dark:border-slate-700">
          <RefreshCw size={20} className={cn(isLoading && 'animate-spin')} />
        </button>
      </div>

      {errorMessage && <div className="rounded-[2rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{errorMessage}</div>}

      {AI_RUNTIME.usesPreviewFallback && (
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Evrim özeti güvenli AI sunucusu yerine yerel önizleme mantığıyla üretiliyor.
        </div>
      )}

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 border-[8px] border-slate-100 dark:border-slate-800 border-t-duo-blue rounded-full animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-duo-blue animate-pulse" size={32} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Veriler işleniyor</p>
          </motion.div>
        ) : insight ? (
          <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 gap-6">
            <div className="p-8 bg-white dark:bg-slate-800/40 rounded-[2.5rem] border-2 border-slate-50 dark:border-slate-700/50 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 text-duo-yellow opacity-5 group-hover:opacity-10 transition-opacity">
                <Star size={80} />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-duo-yellow/10 flex items-center justify-center">
                  <Star size={16} className="text-duo-yellow fill-duo-yellow" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Mevcut durum</span>
              </div>
              <p className="text-lg text-slate-700 dark:text-slate-200 leading-relaxed font-bold italic tracking-tight">"{insight.analysis}"</p>
            </div>

            <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap size={100} />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-premium-gold/20 flex items-center justify-center">
                    <Zap size={16} className="text-premium-gold fill-premium-gold" />
                  </div>
                  <span className="text-[10px] font-black text-premium-gold uppercase tracking-[0.4em]">Bugünün görevi</span>
                </div>
                <p className="text-xl text-white leading-relaxed font-black italic tracking-tight">"{insight.secretMission}"</p>
              </div>
            </div>

            <div className="p-8 bg-duo-blue/5 dark:bg-duo-blue/10 rounded-[2.5rem] border-2 border-duo-blue/20 text-center relative overflow-hidden group">
              <Quote className="absolute -left-4 -top-4 text-duo-blue opacity-5 group-hover:opacity-10 transition-opacity" size={80} />
              <p className="text-lg text-duo-blue-dark dark:text-duo-blue italic font-black leading-relaxed relative z-10 tracking-tight">"{insight.quote}"</p>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-slate-50/30 dark:bg-slate-900/30 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-200 dark:text-slate-700 mx-auto mb-6 border-4 border-slate-50 dark:border-slate-800 shadow-xl">
              <Brain size={40} />
            </div>
            <h4 className="text-lg font-black text-slate-800 dark:text-slate-200 tracking-tight mb-2">İlerlemeni keşfet</h4>
            <button onClick={loadEvolution} className="mt-4 px-10 py-4 bg-duo-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-duo-blue/20">
              Özeti başlat
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
