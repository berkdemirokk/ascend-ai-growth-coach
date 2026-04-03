import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, Zap, Lock, ChevronRight, RefreshCw, Star, Quote, LineChart } from 'lucide-react';
import { UserProfile, DailyTask } from '../types';
import { generateEvolutionInsight, fetchDailyWisdom } from '../services/evolutionService';
import { cn } from '../lib/utils';

interface EvolutionPanelProps {
  profile: UserProfile;
  tasks: DailyTask[];
}

export default function EvolutionPanel({ profile, tasks }: EvolutionPanelProps) {
  const [insight, setInsight] = useState<{ analysis: string; secretMission: string; quote: string } | null>(null);
  const [wisdom, setWisdom] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(profile.level >= 3);

  useEffect(() => {
    setIsUnlocked(profile.level >= 3);
  }, [profile.level]);

  const loadEvolution = async () => {
    if (!isUnlocked || isLoading) return;
    setIsLoading(true);
    try {
      const [newInsight, newWisdom] = await Promise.all([
        generateEvolutionInsight(profile, tasks),
        fetchDailyWisdom()
      ]);
      setInsight(newInsight);
      setWisdom(newWisdom);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isUnlocked && !insight) {
      loadEvolution();
    }
  }, [isUnlocked]);

  if (!isUnlocked) {
    return (
      <div className="duo-card p-8 bg-slate-50/50 relative overflow-hidden group border-dashed border-2">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] z-10">
          <Lock className="text-slate-300 mb-2 group-hover:scale-110 transition-transform" size={32} />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Seviye 3'te Açılır</p>
          <p className="text-[10px] text-slate-300 mt-1 font-bold">Evrim Analizi & Günlük Bilgelik</p>
        </div>
        <div className="opacity-10 blur-sm pointer-events-none">
          <div className="h-6 w-32 bg-slate-200 rounded-full mb-6" />
          <div className="h-32 w-full bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="duo-card p-8 space-y-8 relative overflow-hidden group">
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-duo-blue flex items-center justify-center text-white shadow-[0_4px_0_0_#1899d6]">
            <LineChart size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Evrim Analizi</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">AI Derin Analiz</p>
          </div>
        </div>
        <button 
          onClick={loadEvolution}
          disabled={isLoading}
          className="duo-button duo-button-white p-3"
        >
          <RefreshCw size={20} className={cn(isLoading && "animate-spin")} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 flex flex-col items-center justify-center space-y-4 relative z-10"
          >
            <div className="relative">
              <div className="w-20 h-20 border-8 border-slate-100 border-t-duo-blue rounded-full animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-duo-blue animate-pulse" size={32} />
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Veriler Analiz Ediliyor...</p>
          </motion.div>
        ) : insight ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 relative z-10"
          >
            {/* Analysis */}
            <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <Star size={16} className="text-duo-yellow fill-duo-yellow" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Mevcut Durum</span>
              </div>
              <p className="text-base text-slate-700 leading-relaxed font-bold italic">
                "{insight.analysis}"
              </p>
            </div>

            {/* Secret Mission */}
            <div className="p-6 bg-duo-orange rounded-3xl text-white shadow-[0_6px_0_0_#e58700] relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={16} className="text-white fill-white" />
                  <span className="text-xs font-black text-white/80 uppercase tracking-widest">Gizli Görev</span>
                </div>
                <p className="text-lg text-white leading-relaxed font-black italic">
                  "{insight.secretMission}"
                </p>
              </div>
            </div>

            {/* Wisdom / Quote */}
            <div className="pt-4 text-center space-y-6">
              <div className="relative p-6 bg-duo-blue/10 rounded-3xl border-2 border-duo-blue/20">
                <Quote className="absolute -left-2 -top-2 text-duo-blue/20" size={48} />
                <p className="text-base text-duo-blue-dark italic font-black leading-relaxed relative z-10">
                  "{insight.quote}"
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 relative z-10">
            <Brain className="mx-auto text-slate-200 mb-6" size={64} />
            <button 
              onClick={loadEvolution}
              className="duo-button duo-button-blue px-12"
            >
              Analizi Başlat
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
