import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Dumbbell, Book, Users, Film, Briefcase, Compass, ArrowRight, Sparkles } from 'lucide-react';
import { Path, UserProfile } from '../types';
import { cn } from '../lib/utils';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const paths: { id: Path; title: string; icon: React.ReactNode; color: string; desc: string }[] = [
  { id: 'fitness', title: 'Spor & Sağlık', icon: <Dumbbell />, color: 'bg-orange-500', desc: 'Kilo verme, kas yapma ve sağlıklı yaşam.' },
  { id: 'culture', title: 'Genel Kültür', icon: <Book />, color: 'bg-blue-500', desc: 'Okuma alışkanlığı, yeni bilgiler ve entelektüel gelişim.' },
  { id: 'social', title: 'Sosyal İlişkiler', icon: <Users />, color: 'bg-pink-500', desc: 'Arkadaş edinme, iletişim becerileri ve özgüven.' },
  { id: 'entertainment', title: 'Kültür & Sanat', icon: <Film />, color: 'bg-purple-500', desc: 'Dizi, film ve sanat dünyasında derinleşme.' },
  { id: 'career', title: 'Kariyer & Başarı', icon: <Briefcase />, color: 'bg-indigo-500', desc: 'İş hayatında yükselme ve yeni yetkinlikler.' },
  { id: 'general', title: 'Karar Veremiyorum', icon: <Compass />, color: 'bg-slate-500', desc: 'AI senin için en uygun yolu seçsin.' },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedPath, setSelectedPath] = useState<Path | null>(null);

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2 && selectedPath) {
      onComplete({
        name,
        selectedPath,
        goals: [],
        level: 1,
        experience: 0
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {step === 1 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-10 rounded-[2.5rem] text-center space-y-8"
          >
            <div className="w-20 h-20 bg-brand-500 rounded-3xl mx-auto flex items-center justify-center text-white shadow-2xl shadow-brand-200 rotate-6">
              <Sparkles size={40} />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-slate-900">Hoş Geldin!</h1>
              <p className="text-slate-500 text-lg">Değişim bugün başlıyor. Sana nasıl hitap edelim?</p>
            </div>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adın nedir?"
                className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-brand-500 focus:bg-white rounded-2xl outline-none text-xl text-center transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              />
            </div>
            <button
              onClick={handleNext}
              disabled={!name.trim()}
              className="w-full py-5 bg-brand-600 text-white rounded-2xl font-bold text-lg hover:bg-brand-700 disabled:opacity-50 transition-all shadow-xl shadow-brand-100 flex items-center justify-center gap-2"
            >
              Başlayalım <ArrowRight size={20} />
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Harika, {name}!</h2>
              <p className="text-slate-500 text-lg">Hangi alanda kendini geliştirmek istersin?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paths.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPath(p.id)}
                  className={cn(
                    "p-6 rounded-3xl text-left transition-all border-2 flex items-start gap-4 group",
                    selectedPath === p.id 
                      ? "bg-white border-brand-500 shadow-xl scale-[1.02]" 
                      : "bg-white/50 border-transparent hover:border-slate-200 hover:bg-white"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg transition-transform group-hover:scale-110",
                    p.color
                  )}>
                    {p.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800">{p.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={!selectedPath}
              className="w-full py-5 bg-brand-600 text-white rounded-2xl font-bold text-lg hover:bg-brand-700 disabled:opacity-50 transition-all shadow-xl shadow-brand-100 flex items-center justify-center gap-2"
            >
              Yolculuğa Başla <ArrowRight size={20} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
