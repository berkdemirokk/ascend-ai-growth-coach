import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Book, Briefcase, Clock, Compass, Dumbbell, Film, Flame, ShieldCheck, Sparkles, Target, Users, Zap } from 'lucide-react';
import { Path, StoredUserProfile } from '../types';
import { cn } from '../lib/utils';
import { playSound } from '../lib/sounds';
import { generateProfileAnalysis } from '../services/aiService';
import { AI_RUNTIME } from '../lib/runtime';

interface OnboardingProps {
  onComplete: (profile: StoredUserProfile) => Promise<void> | void;
}

const paths: { id: Path; title: string; icon: React.ReactNode; color: string; desc: string }[] = [
  { id: 'fitness', title: 'Spor ve sağlık', icon: <Dumbbell />, color: 'bg-orange-500', desc: 'Kilo verme, güçlenme ve sağlıklı alışkanlıklar.' },
  { id: 'culture', title: 'Genel kültür', icon: <Book />, color: 'bg-blue-500', desc: 'Okuma, araştırma ve zihinsel gelişim.' },
  { id: 'social', title: 'Sosyal ilişkiler', icon: <Users />, color: 'bg-pink-500', desc: 'İletişim, arkadaşlık ve özgüven alanı.' },
  { id: 'entertainment', title: 'Kültür ve sanat', icon: <Film />, color: 'bg-purple-500', desc: 'Film, müzik ve yaratıcı üretim tarafı.' },
  { id: 'career', title: 'Kariyer', icon: <Briefcase />, color: 'bg-indigo-500', desc: 'İş disiplini, beceri ve profesyonel ilerleme.' },
  { id: 'general', title: 'Genel gelişim', icon: <Compass />, color: 'bg-slate-500', desc: 'Hayat düzenini bütün olarak güçlendirme.' },
];

const levels = [
  { id: 'beginner', title: 'Başlangıç', desc: 'Temelden başlıyorum ve net bir sistem istiyorum.', icon: <Compass /> },
  { id: 'intermediate', title: 'Orta seviye', desc: 'Temelim var, daha kararlı ilerlemek istiyorum.', icon: <Target /> },
  { id: 'advanced', title: 'İleri seviye', desc: 'Yüksek tempoda gelişmek ve sınırlarımı zorlamak istiyorum.', icon: <Zap /> },
] as const;

const intensities = [
  { id: 'casual', title: 'Rahat', desc: 'Düşük baskı, sürdürülebilir tempo.', icon: <Clock /> },
  { id: 'regular', title: 'Düzenli', desc: 'Her gün küçük ama net adımlar.', icon: <Flame /> },
  { id: 'intense', title: 'Yoğun', desc: 'Daha hızlı sonuç için yüksek odak.', icon: <Zap /> },
] as const;

const times = [
  { id: '15m', title: '15 dakika', desc: 'Hızlı ve etkili seanslar.' },
  { id: '30m', title: '30 dakika', desc: 'Dengeli bir günlük alan.' },
  { id: '1h', title: '1 saat', desc: 'Derin çalışma ve tekrar.' },
  { id: '2h+', title: '2 saat+', desc: 'Güçlü odak ve yüksek tempo.' },
] as const;

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedPath, setSelectedPath] = useState<Path | null>(null);
  const [currentLevel, setCurrentLevel] = useState<(typeof levels)[number]['id'] | ''>('');
  const [intensity, setIntensity] = useState<(typeof intensities)[number]['id'] | ''>('');
  const [dailyTime, setDailyTime] = useState<(typeof times)[number]['id'] | ''>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const handleNext = async () => {
    if (step < 5) {
      playSound('click');
      setStep((previous) => previous + 1);
      return;
    }

    if (step !== 5 || !dailyTime || !selectedPath || !currentLevel || !intensity) {
      return;
    }

    setIsAnalyzing(true);
    setSubmissionError(null);
    playSound('success');

    try {
      const analysis = await generateProfileAnalysis({
        name,
        selectedPath,
        currentLevel,
        intensity,
        dailyTime,
      });

      await onComplete({
        name,
        selectedPath,
        goals: [],
        notificationsEnabled: true,
        reminderTime: '09:00',
        theme: 'light',
        currentLevel,
        intensity,
        dailyTime,
        analysis,
      });
    } catch (error) {
      console.error('Onboarding completion error:', error);
      setSubmissionError('Profil oluşturulamadı. Lütfen bağlantını kontrol edip tekrar dene.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="flex flex-col items-center text-center space-y-12">
            <motion.div
              animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="w-40 h-40 bg-gradient-to-br from-duo-blue to-duo-blue-dark rounded-[3rem] flex items-center justify-center border-8 border-white dark:border-slate-800 shadow-2xl"
            >
              <Sparkles size={80} className="text-white" />
            </motion.div>
            <div className="space-y-4">
              <h1 className="text-6xl font-black tracking-tighter gold-text">ASCEND</h1>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-2xl">Merhaba, adın nedir?</p>
            </div>
            <div className="w-full max-w-md space-y-8">
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="İsmin"
                className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-900/50 border-4 border-slate-100 dark:border-slate-800 focus:border-premium-gold rounded-[2rem] outline-none text-2xl text-center font-black dark:text-slate-100"
                onKeyDown={(event) => event.key === 'Enter' && name.trim() && handleNext()}
              />
              <button onClick={handleNext} disabled={!name.trim()} className="w-full duo-button bg-premium-slate text-white py-6 text-xl font-black uppercase tracking-widest disabled:opacity-50">
                Devam et <ArrowRight size={24} className="ml-2" />
              </button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-duo-green rounded-[2rem] flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-800 mx-auto">
                <Compass size={48} className="text-white" />
              </div>
              <h2 className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Neyi geliştirmek istiyorsun?</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-xl">Odaklanacağımız ana alanı seç.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paths.map((path) => (
                <button
                  key={path.id}
                  onClick={() => setSelectedPath(path.id)}
                  className={cn(
                    'p-8 rounded-[2rem] border-4 text-left transition-all flex items-center gap-6',
                    selectedPath === path.id
                      ? 'border-premium-gold bg-premium-gold/5 shadow-xl scale-105'
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-200',
                  )}
                >
                  <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center text-white', path.color)}>{path.icon}</div>
                  <div>
                    <h3 className="font-black uppercase tracking-tight dark:text-slate-100">{path.title}</h3>
                    <p className="text-xs text-slate-400 font-bold">{path.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={handleNext} disabled={!selectedPath} className="w-full duo-button bg-premium-slate text-white py-6 text-xl font-black uppercase tracking-widest disabled:opacity-50">
              Devam et <ArrowRight size={24} className="ml-2" />
            </button>
          </motion.div>
        );

      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-duo-blue rounded-[2rem] flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-800 mx-auto">
                <Target size={48} className="text-white" />
              </div>
              <h2 className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Şu an seviyen nasıl?</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-xl">Planı sana uygun dozda ayarlayalım.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
              {levels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setCurrentLevel(level.id)}
                  className={cn(
                    'p-8 rounded-[2rem] border-4 text-left transition-all flex items-center gap-6',
                    currentLevel === level.id
                      ? 'border-premium-gold bg-premium-gold/5 shadow-xl scale-105'
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-200',
                  )}
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    {level.icon}
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-tight dark:text-slate-100">{level.title}</h3>
                    <p className="text-xs text-slate-400 font-bold">{level.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={handleNext} disabled={!currentLevel} className="w-full duo-button bg-premium-slate text-white py-6 text-xl font-black uppercase tracking-widest disabled:opacity-50">
              Devam et <ArrowRight size={24} className="ml-2" />
            </button>
          </motion.div>
        );

      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-duo-orange rounded-[2rem] flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-800 mx-auto">
                <Flame size={48} className="text-white" />
              </div>
              <h2 className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Tempon nasıl olsun?</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-xl">Günlük baskıyı ve ritmi seç.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
              {intensities.map((tempo) => (
                <button
                  key={tempo.id}
                  onClick={() => setIntensity(tempo.id)}
                  className={cn(
                    'p-8 rounded-[2rem] border-4 text-left transition-all flex items-center gap-6',
                    intensity === tempo.id
                      ? 'border-premium-gold bg-premium-gold/5 shadow-xl scale-105'
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-200',
                  )}
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    {tempo.icon}
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-tight dark:text-slate-100">{tempo.title}</h3>
                    <p className="text-xs text-slate-400 font-bold">{tempo.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={handleNext} disabled={!intensity} className="w-full duo-button bg-premium-slate text-white py-6 text-xl font-black uppercase tracking-widest disabled:opacity-50">
              Devam et <ArrowRight size={24} className="ml-2" />
            </button>
          </motion.div>
        );

      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-duo-purple rounded-[2rem] flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-800 mx-auto">
                <Clock size={48} className="text-white" />
              </div>
              <h2 className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Günlük ne kadar vaktin var?</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-xl">Planı buna göre optimize edeceğiz.</p>
            </div>
            <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
              {times.map((time) => (
                <button
                  key={time.id}
                  onClick={() => setDailyTime(time.id)}
                  className={cn(
                    'p-8 rounded-[2rem] border-4 text-center transition-all flex flex-col items-center gap-4',
                    dailyTime === time.id
                      ? 'border-premium-gold bg-premium-gold/5 shadow-xl scale-105'
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-200',
                  )}
                >
                  <h3 className="font-black uppercase tracking-tight dark:text-slate-100">{time.title}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{time.desc}</p>
                </button>
              ))}
            </div>

            {AI_RUNTIME.usesPreviewFallback && (
              <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                Güvenli AI sunucusu bu önizleme yapısında bağlı değil. Profil özeti yerel önizleme mantığıyla hazırlanacak ve ilk plan doğrulanmış ilerleme üretmeyecek.
              </div>
            )}

            {submissionError && <div className="rounded-[2rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{submissionError}</div>}

            <button
              onClick={handleNext}
              disabled={!dailyTime || isAnalyzing}
              className="w-full duo-button bg-premium-slate text-white py-6 text-xl font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-4"
            >
              {isAnalyzing ? (
                <>
                  Plan hazırlanıyor... <Sparkles className="animate-spin" />
                </>
              ) : (
                <>
                  Yolculuğa başla <ShieldCheck size={24} />
                </>
              )}
            </button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-[#0f1115] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-duo-blue/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-premium-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

        <div className="mt-12 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((currentStep) => (
            <div
              key={currentStep}
              className={cn(
                'h-2 rounded-full transition-all duration-500',
                currentStep === step ? 'w-12 bg-premium-gold' : 'w-2 bg-slate-100 dark:bg-slate-800',
                currentStep < step && 'bg-duo-green',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
