import React, { useState } from 'react';
import { motion } from 'motion/react';
import { HelpCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { buildDecisionResult } from '../lib/localCoach';
import { requestDecision } from '../lib/aiClient';

export default function DecisionTool() {
  const [options, setOptions] = useState<string[]>(['', '']);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const addOption = () => setOptions((current) => [...current, '']);

  const updateOption = (index: number, value: string) => {
    setOptions((current) => current.map((option, optionIndex) => (optionIndex === index ? value : option)));
  };

  const handleDecide = async () => {
    const validOptions = options.filter((option) => option.trim());
    if (validOptions.length < 2) return;

    setIsLoading(true);
    try {
      const reply = await requestDecision(validOptions).catch(() => {
        setIsUsingFallback(true);
        return buildDecisionResult(validOptions);
      });

      setResult(reply);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass p-6 rounded-3xl space-y-6">
      <div className="flex items-center gap-2">
        <HelpCircle className="text-brand-500" size={20} />
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Karar yardımcısı</h3>
      </div>

      {!result ? (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Seçeneklerini yaz. Sistem sana kısa ve uygulanabilir bir karar önerisi sunsun.</p>
          <div className="space-y-2">
            {options.map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Seçenek ${index + 1}`}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:border-brand-300 transition-colors"
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={addOption}
              className="flex-1 py-2 text-xs font-bold text-brand-600 border border-brand-200 rounded-xl hover:bg-brand-50 transition-colors"
            >
              + Seçenek ekle
            </button>
            <button
              onClick={handleDecide}
              disabled={isLoading || options.filter((option) => option.trim()).length < 2}
              className="flex-1 py-2 text-xs font-bold bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? 'Düşünüyor...' : 'Karar ver'} <Sparkles size={14} />
            </button>
          </div>
          {isUsingFallback && <p className="text-[11px] text-slate-400">Hızlı karar modu kullanıldı.</p>}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-brand-50 p-4 rounded-2xl border border-brand-100 space-y-3"
        >
          <div className="flex items-center gap-2 text-brand-700 font-bold text-sm">
            <CheckCircle2 size={16} /> Karar önerisi
          </div>
          <p className="text-sm text-slate-700 leading-relaxed italic">{result}</p>
          <button
            onClick={() => {
              setResult(null);
              setOptions(['', '']);
              setIsUsingFallback(false);
            }}
            className="w-full py-2 text-[10px] font-bold text-brand-600 uppercase tracking-widest hover:underline"
          >
            Yeni değerlendirme
          </button>
        </motion.div>
      )}
    </div>
  );
}
