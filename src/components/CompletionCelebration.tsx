import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame } from 'lucide-react';

interface CompletionCelebrationProps {
  visible: boolean;
  xp: number;
  streak: number;
  onDone: () => void;
}

export default function CompletionCelebration({ visible, xp, streak, onDone }: CompletionCelebrationProps) {
  React.useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDone, 1800);
    return () => clearTimeout(timer);
  }, [visible, onDone]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          <motion.div
            className="relative flex flex-col items-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          >
            <div className="relative">
              <motion.div
                className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-2xl shadow-orange-300"
                animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Flame size={72} className="text-yellow-200 fill-yellow-300" strokeWidth={1.5} />
              </motion.div>

              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full bg-yellow-400"
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos((i / 8) * Math.PI * 2) * 100,
                    y: Math.sin((i / 8) * Math.PI * 2) * 100,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              ))}
            </div>

            <motion.div
              className="mt-6 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-3xl font-black text-slate-900">+{xp} XP</p>
              <p className="mt-1 text-base font-bold text-orange-600">{streak} gün seri 🔥</p>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
