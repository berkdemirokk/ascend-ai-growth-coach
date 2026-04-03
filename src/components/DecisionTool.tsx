import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Sparkles, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { generateAIResponse } from '../services/aiService';
import { UserProfile } from '../types';

interface DecisionToolProps {
  profile: UserProfile;
}

export default function DecisionTool({ profile }: DecisionToolProps) {
  const [options, setOptions] = useState<string[]>(['', '']);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isUnlocked = profile.level >= 2;

  if (!isUnlocked) {
    return (
      <div className="glass p-6 rounded-3xl border-dashed border-2 border-slate-200 bg-slate-50/50 relative overflow-hidden group">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/5 backdrop-blur-[2px] z-10">
          <Lock className="text-slate-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Seviye 2'de Açılır</p>
          <p className="text-[8px] text-slate-400 mt-1 italic">AI Karar Verme Asistanı</p>
        </div>
        <div className="opacity-20 blur-sm pointer-events-none">
          <div className="h-4 w-24 bg-slate-200 rounded mb-4" />
          <div className="h-20 w-full bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const addOption = () => setOptions([...options, '']);
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleDecide = async () => {
    const validOptions = options.filter(o => o.trim());
    if (validOptions.length < 2) return;

    setIsLoading(true);
    try {
      const prompt = `Şu seçenekler arasında bir karar vermeme yardımcı ol: ${validOptions.join(', ')}. 
      Lütfen bir tanesini seç ve nedenini kısaca açıkla. Yanıtın kısa ve öz olsun.`;
      const context = "Sen tarafsız ve rasyonel bir karar verme asistanısın. Kullanıcının ikilemlerini çözmesine yardımcı olursun.";
      
      const response = await generateAIResponse(prompt, context);
      setResult(response.text || "Bir karar verilemedi.");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="duo-card p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-duo-orange flex items-center justify-center text-white shadow-[0_4px_0_0_#e58700]">
          <HelpCircle size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Karar Verici</h3>
          <p className="text-xs text-slate-400 font-bold">AI Senin İçin Seçsin</p>
        </div>
      </div>

      {!result ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 font-bold">Seçeneklerini gir, Duo senin için en mantıklısını seçsin.</p>
          <div className="space-y-3">
            {options.map((opt, idx) => (
              <input
                key={idx}
                type="text"
                value={opt}
                onChange={(e) => updateOption(idx, e.target.value)}
                placeholder={`Seçenek ${idx + 1}`}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-base font-bold outline-none focus:border-duo-orange transition-colors"
              />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <button 
              onClick={addOption}
              className="duo-button duo-button-white w-full"
            >
              + Seçenek Ekle
            </button>
            <button 
              onClick={handleDecide}
              disabled={isLoading || options.filter(o => o.trim()).length < 2}
              className="duo-button duo-button-blue w-full"
            >
              {isLoading ? 'Düşünüyor...' : 'Karar Ver'} <Sparkles size={18} className="ml-2" />
            </button>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-duo-orange/10 p-6 rounded-3xl border-2 border-duo-orange/20 space-y-4"
        >
          <div className="flex items-center gap-2 text-duo-orange-dark font-black text-base">
            <CheckCircle2 size={20} /> Duo'nun Kararı:
          </div>
          <p className="text-lg text-slate-700 leading-relaxed font-black italic">"{result}"</p>
          <button 
            onClick={() => {setResult(null); setOptions(['', '']);}}
            className="duo-button duo-button-white w-full"
          >
            Yeni Karar
          </button>
        </motion.div>
      )}
    </div>
  );
}
