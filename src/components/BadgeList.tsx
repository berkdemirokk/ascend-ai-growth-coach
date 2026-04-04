import React from 'react';
import { motion } from 'motion/react';
import { Badge as BadgeType } from '../types';
import { Award, Book, Briefcase, Compass, Film, Star, Target, Trophy, Users, Zap } from 'lucide-react';

interface BadgeListProps {
  badges: BadgeType[];
}

const badgeIcons: Record<string, React.ReactNode> = {
  trophy: <Trophy size={24} />,
  star: <Star size={24} />,
  zap: <Zap size={24} />,
  target: <Target size={24} />,
  book: <Book size={24} />,
  users: <Users size={24} />,
  film: <Film size={24} />,
  briefcase: <Briefcase size={24} />,
  compass: <Compass size={24} />,
  award: <Award size={24} />,
};

export default function BadgeList({ badges }: BadgeListProps) {
  if (badges.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50/30 dark:bg-slate-900/30 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
        <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-200 dark:text-slate-700 mx-auto mb-6 border-4 border-slate-50 dark:border-slate-800 shadow-xl">
          <Award size={48} />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Henüz rozetin yok</p>
        <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] mt-2 max-w-[200px] mx-auto">Görevleri tamamladıkça başarıların burada görünmeye başlayacak.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
      {badges.map((badge, index) => (
        <motion.div
          key={badge.id}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{
            scale: 1.05,
            y: -12,
            transition: { type: 'spring', stiffness: 400, damping: 15 },
          }}
          transition={{
            delay: index * 0.05,
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          className="duo-card p-8 flex flex-col items-center text-center space-y-6 group hover:border-premium-gold/30 hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] transition-all cursor-default border-slate-100 dark:border-slate-800/50 bg-white dark:bg-[#0f1115] rounded-[2.5rem] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-premium-gold/0 to-premium-gold/0 group-hover:from-premium-gold/5 group-hover:to-premium-gold/10 transition-all duration-500" />

          <div className="w-24 h-24 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:text-premium-gold transition-all duration-500 shadow-inner relative z-10">
            <div className="group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">{badgeIcons[badge.icon] || <Award size={40} />}</div>
          </div>

          <div className="space-y-2 relative z-10">
            <h4 className="text-base font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight group-hover:text-premium-gold transition-colors">{badge.title}</h4>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold leading-relaxed">{badge.description}</p>
          </div>

          <div className="pt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 relative z-10">
            <div className="h-1.5 w-12 bg-premium-gold rounded-full mx-auto shadow-[0_0_12px_rgba(212,175,55,0.5)]" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
