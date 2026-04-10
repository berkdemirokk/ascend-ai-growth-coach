import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Book, Briefcase, Compass, Dumbbell, Film, Sparkles, Users } from 'lucide-react';
import { DailyCommitmentMinutes, OnboardingTempo, Path, UserProfile } from '../types';
import { cn } from '../lib/utils';
import { DAILY_MINUTES_LABELS, PATH_LABELS, PATH_SHORT_DESCRIPTIONS, TEMPO_LABELS } from '../lib/productCopy';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onShowRestore: () => void;
}

type OnboardingStep = 'welcome' | 'focus' | 'pace' | 'summary' | 'paywall';

const STEP_ORDER: OnboardingStep[] = ['welcome', 'focus', 'pace', 'summary', 'paywall'];

const pathCards: { id: Path; icon: React.ReactNode; color: string }[] = [
  { id: 'fitness', icon: <Dumbbell size={20} />, color: 'bg-orange-500' },
  { id: 'culture', icon: <Book size={20} />, color: 'bg-blue-500' },
  { id: 'social', icon: <Users size={20} />, color: 'bg-pink-500' },
  { id: 'entertainment', icon: <Film size={20} />, color: 'bg-purple-500' },
  { id: 'career', icon: <Briefcase size={20} />, color: 'bg-indigo-500' },
  { id: 'general', icon: <Compass size={20} />, color: 'bg-slate-500' },
];

const tempoOptions: { id: OnboardingTempo; title: string; description: string }[] = [
  { id: 'calm', title: 'Sakin tempo', description: 'Düşük baskı, sürdürülebilir günlük akış.' },
  { id: 'steady', title: 'Dengeli tempo', description: 'Her gün net bir görevle istikrarlı ilerleme.' },
  { id: 'focused', title: 'Yüksek odak', description: 'Daha yoğun ama uygulanabilir bir tempo.' },
];

const minuteOptions: DailyCommitmentMinutes[] = [15, 25, 40];

export default function Onboarding({ onComplete, onShowRestore }: OnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [name, setName] = useState('');
  const [selectedPath, setSelectedPath] = useState<Path | null>(null);
  const [tempo, setTempo] = useState<OnboardingTempo>('steady');
  const [dailyMinutes, setDailyMinutes] = useState<DailyCommitmentMinutes>(25);

  const currentStepIndex = STEP_ORDER.indexOf(step);

  const canContinue = useMemo(() => {
    if (step === 'welcome') return Boolean(name.trim());
    if (step === 'focus') return Boolean(selectedPath);
    return true;
  }, [name, selectedPath, step]);

  const moveToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex >= STEP_ORDER.length) return;
    setStep(STEP_ORDER[nextIndex]);
  };

  const moveToPreviousStep = () => {
    const nextIndex = currentStepIndex - 1;
    if (nextIndex < 0) return;
    setStep(STEP_ORDER[nextIndex]);
  };

  const handleFinish = () => {
    onComplete({
      name: name.trim(),
      selectedPath,
      goals: [],
      planTier: 'free',
      onboardingTempo: tempo,
      dailyMinutes,
      level: 1,
      experience: 0,
      streak: 0,
      lastCompletedDayKey: null,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 py-[max(1rem,env(safe-area-inset-top))]">
      <div className="max-w-3xl w-full space-y-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center gap-2 justify-center">
          {STEP_ORDER.map((entry, index) => (
            <div
              key={entry}
              className={cn(
                'h-2.5 rounded-full transition-all',
                index < currentStepIndex ? 'w-10 bg-brand-500' : index === currentStepIndex ? 'w-12 bg-brand-300' : 'w-7 bg-slate-200',
              )}
            />
          ))}
        </div>

        {step === 'welcome' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] text-center space-y-8">
            <div className="w-20 h-20 bg-brand-500 rounded-3xl mx-auto flex items-center justify-center text-white shadow-2xl shadow-brand-200">
              <Sparkles size={38} />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Her gün ne yapacağını bil</h1>
              <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto">
                Ascend, seviyene göre günlük görev veren kişisel gelişim sistemidir. Kısa adımlarla net ilerlersin.
              </p>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Sana nasıl hitap edelim?"
                className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 border-2 border-transparent focus:border-brand-500 focus:bg-white rounded-2xl outline-none text-lg sm:text-xl text-center transition-all"
                onKeyDown={(event) => event.key === 'Enter' && canContinue && moveToNextStep()}
              />
              <button
                onClick={moveToNextStep}
                disabled={!canContinue}
                className="w-full py-5 bg-brand-600 text-white rounded-2xl font-bold text-lg hover:bg-brand-700 disabled:opacity-50 transition-all shadow-xl shadow-brand-100 flex items-center justify-center gap-2"
              >
                Devam et <ArrowRight size={20} />
              </button>
              <button onClick={onShowRestore} className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-semibold text-base hover:bg-slate-200 transition-all">
                Mevcut hesabımı geri yükle
              </button>
            </div>
          </motion.div>
        )}

        {step === 'focus' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Odak alanını seç</h2>
              <p className="text-slate-500 text-base sm:text-lg">Planın bu seçime göre kişiselleştirilecek.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pathCards.map((path) => (
                <button
                  key={path.id}
                  onClick={() => setSelectedPath(path.id)}
                  className={cn(
                    'p-5 rounded-3xl text-left transition-all border-2 flex items-start gap-4 group bg-white',
                    selectedPath === path.id ? 'border-brand-500 shadow-xl scale-[1.01]' : 'border-slate-100 hover:border-slate-200',
                  )}
                >
                  <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg', path.color)}>{path.icon}</div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900">{PATH_LABELS[path.id]}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{PATH_SHORT_DESCRIPTIONS[path.id]}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={moveToPreviousStep} className="sm:w-44 py-4 bg-slate-100 text-slate-700 rounded-2xl font-semibold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                <ArrowLeft size={18} /> Geri
              </button>
              <button onClick={moveToNextStep} disabled={!canContinue} className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                Devam et <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'pace' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Planının temposunu belirle</h2>
              <p className="text-slate-500 text-base sm:text-lg">Sana uygun ritmi seç, sistem bunu günlük görevlere yansıtsın.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {tempoOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setTempo(option.id)}
                  className={cn(
                    'rounded-2xl border-2 p-4 text-left transition-all bg-white',
                    tempo === option.id ? 'border-brand-500 shadow-lg' : 'border-slate-100 hover:border-slate-200',
                  )}
                >
                  <p className="text-sm font-bold text-slate-900">{option.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">{option.description}</p>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Günlük ayırabileceğin süre</p>
              <div className="grid grid-cols-3 gap-3">
                {minuteOptions.map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => setDailyMinutes(minutes)}
                    className={cn(
                      'py-3 rounded-2xl border-2 bg-white font-semibold transition-all',
                      dailyMinutes === minutes ? 'border-brand-500 text-brand-700' : 'border-slate-100 text-slate-700 hover:border-slate-200',
                    )}
                  >
                    {DAILY_MINUTES_LABELS[minutes]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={moveToPreviousStep} className="sm:w-44 py-4 bg-slate-100 text-slate-700 rounded-2xl font-semibold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                <ArrowLeft size={18} /> Geri
              </button>
              <button onClick={moveToNextStep} className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2">
                Plan özetine geç <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'summary' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-[2.5rem] p-6 sm:p-8 space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Kişisel planın hazır</h2>
              <p className="text-slate-500">Sistem bu ayarlarla her gün net bir görev üretecek.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white border border-slate-100 p-4">
                <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-slate-400">Odak alanı</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{PATH_LABELS[selectedPath ?? 'general']}</p>
              </div>
              <div className="rounded-2xl bg-white border border-slate-100 p-4">
                <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-slate-400">Tempo</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{TEMPO_LABELS[tempo]}</p>
              </div>
              <div className="rounded-2xl bg-white border border-slate-100 p-4">
                <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-slate-400">Günlük süre</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{DAILY_MINUTES_LABELS[dailyMinutes]}</p>
              </div>
              <div className="rounded-2xl bg-white border border-slate-100 p-4">
                <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-slate-400">İlerleme modeli</p>
                <p className="mt-2 text-base font-semibold text-slate-900">Günlük görev + düzenli seri + seviye artışı</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 text-slate-100 p-4">
              <p className="text-sm leading-relaxed">
                {name.trim()}, ilk gün hedefin tek: bugünün görevini bitirmek. Küçük ama tutarlı adımlar birkaç gün içinde görünür bir ilerleme üretir.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={moveToPreviousStep} className="sm:w-44 py-4 bg-slate-100 text-slate-700 rounded-2xl font-semibold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                <ArrowLeft size={18} /> Geri
              </button>
              <button onClick={moveToNextStep} className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2">
                Planı aç <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'paywall' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-[2.5rem] p-6 sm:p-8 space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Planını aç</h2>
              <p className="text-slate-500">Temel plan bu cihazda hemen aktif olur. Premium için App Store satın alma entegrasyonu gerekir.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
                <p className="text-sm font-semibold text-brand-900">Premium Plan</p>
                <p className="mt-1 text-xs leading-relaxed text-brand-800">Satın alma tamamlandığında adaptif haftalık plan ve gelişmiş analizler açılır.</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">Temel Plan</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">Günlük görev, görev tamamlama, seri takibi ve temel ilerleme görünümü.</p>
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={handleFinish} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all">
                Temel planla devam et
              </button>
              <button onClick={onShowRestore} className="w-full py-3 text-sm text-slate-500 hover:text-slate-700 transition-colors">
                Satın alma veya hesabını geri yükle
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
