import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, Target, ChevronRight, RefreshCw, Zap, Trophy, Flame } from 'lucide-react';
import { Path, Message, UserProfile } from '../types';
import { cn } from '../lib/utils';
import { generateAIResponse } from '../services/aiService';

interface CoachProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

export default function Coach({ profile, onUpdateProfile }: CoachProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      const initialMessage = `Selam ${profile.name}! Ben senin gelişim motorunum. Lafı uzatmayalım, bugün seni hangi konuda zorlamamı istersin? "${profile.selectedPath}" yolunda zirveye çıkman için buradayım. Aşağıdaki butonlardan birini seç veya bana durumunu anlat.`;
      setMessages([{ role: 'model', text: initialMessage, timestamp: Date.now() }]);
    }
  }, [profile.name, profile.selectedPath]);

  const quickActions = [
    { label: "Bana Görev Ver", icon: <Zap size={16} />, prompt: "Bana hemen yapabileceğim somut bir gelişim görevi ver." },
    { label: "Bugün Ne Yapmalıyım?", icon: <Target size={16} />, prompt: "Bugünkü gelişim planımı hazırla." },
    { label: "Zorluk Seviyesini Artır", icon: <Flame size={16} />, prompt: "Şu anki tempom az geliyor, beni daha çok zorla." },
    { label: "Bir Karar Vermem Lazım", icon: <Sparkles size={16} />, prompt: "Bir konuda kararsızım, bana yardımcı ol." },
  ];

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    // We'll trigger handleSend in the next tick to ensure input is updated
    setTimeout(() => {
      const btn = document.getElementById('send-btn');
      btn?.click();
    }, 0);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = `Sen dünyanın en sert ama en etkili kişisel gelişim koçusun. Kullanıcının adı: ${profile.name}. Seçtiği alan: ${profile.selectedPath}. 
      KURALLAR:
      1. Chatbot gibi davranma. Bir komutan, bir mentor, bir gelişim motoru gibi davran.
      2. Boş laf yapma. Her yanıtın sonunda mutlaka kullanıcıya yapması gereken SOMUT BİR GÖREV ver.
      3. Kullanıcıyı konfor alanından çıkar. Ona meydan oku.
      4. Yanıtların kısa, öz ve vurucu olsun.
      5. Kullanıcı bir görevi tamamladığını söylerse onu tebrik et ve hemen bir sonrakini ver.
      6. Yanıtlarını Markdown formatında ver.`;

      const response = await generateAIResponse(input, context);
      const modelText = response.text || "Üzgünüm, bir hata oluştu. Lütfen tekrar dene.";
      
      setMessages(prev => [...prev, { role: 'model', text: modelText, timestamp: Date.now() }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Bağlantı hatası oluştu. Lütfen internetini kontrol et.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto w-full glass rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-white/50 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-xl shadow-brand-200">
              <Bot size={28} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-tight font-display tracking-tight">Ascend Engine</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              Proactive Growth Mentor
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-1.5 rounded-xl bg-brand-50 text-brand-700 text-[10px] font-black uppercase tracking-widest border border-brand-100 flex items-center gap-2">
            <Target size={14} />
            {profile.selectedPath}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth no-scrollbar"
      >
        {/* Duo Character Introduction */}
        <div className="flex flex-col items-center text-center space-y-4 py-8">
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-32 h-32 bg-duo-green rounded-[2.5rem] flex items-center justify-center shadow-[0_8px_0_0_#46a302] relative"
          >
            <div className="absolute top-6 left-6 w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-black rounded-full" />
            </div>
            <div className="absolute top-6 right-6 w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-black rounded-full" />
            </div>
            <div className="absolute bottom-6 w-8 h-4 bg-duo-orange rounded-full" />
          </motion.div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-800">Ben Duo!</h3>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Gelişim Rehberin</p>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.timestamp + idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "flex w-full gap-4 items-end",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm font-black text-white",
                msg.role === 'user' ? "bg-duo-blue shadow-[0_4px_0_0_#1899d6]" : "bg-duo-green shadow-[0_4px_0_0_#46a302]"
              )}>
                {msg.role === 'user' ? "S" : "D"}
              </div>
              <div className={cn(
                "max-w-[80%] p-6 rounded-3xl border-2 transition-all relative",
                msg.role === 'user' 
                  ? "bg-duo-blue border-duo-blue-dark text-white rounded-br-none" 
                  : "bg-white border-slate-200 text-slate-800 rounded-bl-none"
              )}>
                <div className={cn(
                  "markdown-body text-base leading-relaxed",
                  msg.role === 'user' ? "text-white prose-invert" : "text-slate-700"
                )}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
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

      {/* Input */}
      <div className="p-6 bg-white border-t-2 border-slate-100">
        <div className="relative flex items-center max-w-3xl mx-auto gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Mesajını yaz..."
            className="flex-1 px-6 py-4 bg-slate-100 border-2 border-slate-200 rounded-2xl focus:border-duo-blue transition-all outline-none text-slate-700 font-bold"
          />
          <button
            id="send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="duo-button duo-button-blue p-4"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
