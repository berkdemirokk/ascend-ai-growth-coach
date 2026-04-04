import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, HelpCircle, Lock, RefreshCw, Sparkles } from 'lucide-react';
import { generateAIResponse } from '../services/aiService';
import { UserProfile } from '../types';
import { playSound } from '../lib/sounds';
import { AI_RUNTIME } from '../lib/runtime';

interface DecisionToolProps {
  profile: UserProfile;
}

export default function DecisionTool({ profile }: DecisionToolProps) {
  const [options, setOptions] = useState<string[]>(['', '']);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isUnlocked = profile.level >= 2 || profile.isPremium;

  if (!isUnlocked) {
    return (
      <div className="duo-card p-8 border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 relative overflow-hidden group">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/5 dark:bg-slate-900/40 backdrop-blur-[2px] z-10">
          <Lock className="text-slate-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
          <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Seviye 2 veya Premium ile açılır</p>
          <p className="text-[8px] text-slate-400 mt-1 italic">Karar verme asistanı</p>
        </div>
        <div className="opacity-20 blur-sm pointer-events-none">
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div className="h-20 w-full bg-slate-200 dark:bg-slate-700 rounded-2xl" />
        </div>
      </div>
    );
  }

  const addOption = () => {
    playSound('click');
    setOptions([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const nextOptions = [...options];
    nextOptions[index] = value;
    setOptions(nextOptions);
  };

  const handleDecide = async () => {
    const validOptions = options.filter((option) => option.trim());
    if (validOptions.length < 2) {
      return;
    }

    playSound('click');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const prompt = `Şu seçenekler arasında karar vermeme yardım et: ${validOptions.join(', ')}. Birini seç ve nedenini kısa açıkla.`;
      const context = 'Tarafsız ve uygulanabilir tavsiyeler veren bir karar verme asistanısın.';
      const response = await generateAIResponse(prompt, context);
      playSound('success');
      setResult(response.text || 'Şu an net bir öneri üretilemedi.');
    } catch (error) {
      console.error('Decision tool error:', error);
      setErrorMessage('Karar desteği üretilemedi. Lütfen tekrar dene.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="duo-card p-10 space-y-8 relative overflow-hidden bg-white dark:bg-[#0f1115] border-none shadow-2xl rounded-[2.5rem]">
      {profile.isPremium && (
        <div className="absolute top-0 right-0 p-8 text-premium-gold opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
          <Sparkles size={120} />
        </div>
      )}

      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-duo-orange to-duo-orange-dark flex items-center justify-center text-white shadow-xl">
          <HelpCircle size={32} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Karar verici</h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">İkilemi netleştir</p>
        </div>
      </div>

      {errorMessage && <div className="rounded-[2rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{errorMessage}</div>}

      {AI_RUNTIME.usesPreviewFallback && (
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Karar desteği bu önizleme yapısında yerel kurallarla çalışıyor; güvenli AI sunucusuna bağlı değil.
        </div>
      )}

      {!result ? (
        <div className="space-y-8">
          <p className="text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Seçeneklerini yaz, sistem sana daha uygulanabilir olanı önersin.
          </p>
          <div className="space-y-4">
            {options.map((option, index) => (
              <div key={`${index}-${option.length}`} className="relative group">
                <input
                  type="text"
                  value={option}
                  onChange={(event) => updateOption(index, event.target.value)}
                  placeholder={`Seçenek ${index + 1}`}
                  className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-lg font-bold outline-none focus:border-duo-orange transition-all dark:text-slate-100 shadow-inner"
                />
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-duo-orange/20 group-focus-within:bg-duo-orange rounded-l-2xl transition-colors" />
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button onClick={addOption} className="flex-1 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
              + Seçenek ekle
            </button>
            <button
              onClick={handleDecide}
              disabled={isLoading || options.filter((option) => option.trim()).length < 2}
              className="flex-[2] duo-button bg-duo-orange text-white shadow-xl py-5 text-sm flex items-center justify-center gap-3 hover:scale-105 transition-transform disabled:opacity-50"
            >
              {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <Sparkles size={20} />}
              {isLoading ? 'Düşünüyor...' : 'Karar ver'}
            </button>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="bg-duo-orange/5 dark:bg-duo-orange/10 p-10 rounded-[2.5rem] border-2 border-duo-orange/20 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 text-duo-orange opacity-5">
            <CheckCircle2 size={120} />
          </div>
          <div className="flex items-center gap-3 text-duo-orange font-black text-xs uppercase tracking-[0.3em] relative z-10">
            <CheckCircle2 size={20} /> Önerilen karar
          </div>
          <p className="text-2xl text-slate-800 dark:text-slate-100 leading-relaxed font-black italic tracking-tight relative z-10">"{result}"</p>
          <button onClick={() => { setResult(null); setOptions(['', '']); }} className="w-full px-8 py-5 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-duo-orange hover:border-duo-orange transition-all relative z-10">
            Yeni değerlendirme
          </button>
        </motion.div>
      )}
    </div>
  );
}
