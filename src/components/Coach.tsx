import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Target, RefreshCw } from 'lucide-react';
import { DailyTask, Message, UserProfile } from '../types';
import { cn } from '../lib/utils';
import { buildCoachReply, buildWelcomeMessage } from '../lib/localCoach';
import { requestCoachReply } from '../lib/aiClient';
import { getAdaptationSignal, getSignalLabel } from '../lib/adaptation';
import { getPlanTierLabel, isPremiumProfile } from '../lib/premium';
import { getPathLabel } from '../lib/productCopy';
import { formatUiText } from '../lib/textFormat';

const CoachMarkdown = lazy(() => import('./CoachMarkdown'));

interface CoachProps {
  profile: UserProfile;
  activeTask: DailyTask | null;
  tasks: DailyTask[];
}

export default function Coach({ profile, activeTask, tasks }: CoachProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const adaptationSignal = getAdaptationSignal(tasks);
  const adaptationLabel = getSignalLabel(adaptationSignal);
  const premium = isPremiumProfile(profile);

  useEffect(() => {
    setMessages([
      {
        role: 'model',
        text: buildWelcomeMessage(profile, activeTask),
        timestamp: Date.now(),
      },
    ]);
    setIsUsingFallback(false);
  }, [profile, activeTask]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input.trim(), timestamp: Date.now() };
    const history = [...messages, userMessage];

    setMessages(history);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await requestCoachReply(profile, history, userMessage.text, activeTask, tasks).catch(() => {
        setIsUsingFallback(true);
        return buildCoachReply(profile, history, userMessage.text, activeTask, tasks);
      });

      setMessages((prev) => [...prev, { role: 'model', text: reply, timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageBody = (message: Message) => {
    const inverted = message.role === 'user';

    if (message.role === 'user') {
      return <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.text}</div>;
    }

    return (
      <Suspense fallback={<div className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.text}</div>}>
        <CoachMarkdown text={message.text} inverted={inverted} />
      </Suspense>
    );
  };

  return (
    <div className="flex flex-col min-h-[36rem] md:h-[calc(100vh-8rem)] max-w-4xl mx-auto w-full glass rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-200">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">Günlük koç</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className={cn('w-2 h-2 rounded-full', isUsingFallback ? 'bg-amber-500' : 'bg-green-500')}></span>
              {isUsingFallback ? 'Standart koç modu' : 'Gelişmiş koç modu'} · {getPlanTierLabel(profile.planTier)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium flex items-center gap-1">
            <Target size={14} />
            {getPathLabel(profile.selectedPath)}
          </div>
        </div>
      </div>

      {activeTask && (
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-400">Bugünün bağlamı</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{formatUiText(activeTask.title)}</p>
          <p className="mt-1 text-xs text-slate-600 line-clamp-2">{formatUiText(activeTask.description)}</p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.16em] font-semibold text-brand-500">{adaptationLabel}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.16em] font-semibold text-slate-400">
            {premium ? 'Derin bağlam açık' : 'Temel bağlam'}
          </p>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.timestamp + index}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn('flex w-full gap-3', message.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                  message.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-brand-100 text-brand-600',
                )}
              >
                {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div
                className={cn(
                  'max-w-[80%] p-4 rounded-2xl shadow-sm',
                  message.role === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none',
                )}
              >
                {renderMessageBody(message)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
              <RefreshCw size={16} className="animate-spin" />
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Bugünkü görev, odağın veya zorlandığın nokta hakkında yaz..."
            className="w-full pl-6 pr-14 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all outline-none text-slate-700"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:hover:bg-brand-600 transition-colors shadow-lg shadow-brand-200"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="mt-3 text-center text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
          {isUsingFallback ? 'Koç hızlı modda çalışıyor' : 'Koç hazır'}
        </p>
      </div>
    </div>
  );
}
