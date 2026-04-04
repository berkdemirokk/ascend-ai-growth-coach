import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Star, Trophy, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../lib/sounds';

interface LevelUpModalProps {
  level: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function LevelUpModal({ level, isOpen, onClose }: LevelUpModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    playSound('success');
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />

          <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-[#0f1115] rounded-[3.5rem] p-12 text-center shadow-[0_64px_128px_-24px_rgba(0,0,0,0.6)] border-none overflow-hidden">
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-duo-blue/30 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-premium-gold/30 rounded-full blur-[100px] animate-pulse [animation-delay:1s]" />

            <div className="absolute -top-20 left-1/2 -translate-x-1/2">
              <motion.div
                animate={{
                  rotate: [0, 8, -8, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="w-40 h-40 bg-gradient-to-br from-premium-gold via-yellow-400 to-premium-gold rounded-[3rem] flex items-center justify-center shadow-[0_20px_50px_rgba(212,175,55,0.4)] border-8 border-white dark:border-slate-900"
              >
                <Trophy size={80} className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.2)]" />
              </motion.div>
            </div>

            <div className="mt-24 space-y-10">
              <div className="space-y-3">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <h2 className="text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter gold-text">Tebrikler!</h2>
                  <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.5em] mt-3">Seviye {level} gelişimci</p>
                </motion.div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="p-8 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-inner group hover:border-premium-gold/30 transition-colors">
                  <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-premium-gold mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <Star fill="currentColor" size={20} />
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Yeni seviye</p>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-100">Daha geniş görünüm</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="p-8 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-inner group hover:border-duo-orange/30 transition-colors">
                  <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-duo-orange mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <Zap fill="currentColor" size={20} />
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Momentum</p>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-100">Sistem güçleniyor</p>
                </motion.div>
              </div>

              <div className="space-y-8">
                <p className="text-lg text-slate-500 dark:text-slate-400 font-black leading-relaxed italic tracking-tight">
                  "Sınırlarını zorladın ve bir üst basamağa çıktın. Şimdi önemli olan ritmini korumak."
                </p>

                <button onClick={onClose} className="w-full duo-button bg-premium-slate text-white shadow-2xl py-6 text-sm font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-premium-black hover:scale-105 transition-all group">
                  Yolculuğa devam et
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
