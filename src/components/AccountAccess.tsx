import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, KeyRound } from 'lucide-react';

interface AccountAccessProps {
  onStartFresh: () => void;
  onRestore: (email: string, password: string) => Promise<string | null>;
}

export default function AccountAccess({ onStartFresh, onRestore }: AccountAccessProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRestore = async () => {
    setIsLoading(true);
    setError(null);
    const nextError = await onRestore(email.trim(), password);
    setError(nextError);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-xl w-full glass p-6 sm:p-10 rounded-[2rem] space-y-7">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg">
            <KeyRound size={26} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Hesabina giris yap</h1>
            <p className="text-slate-500 text-base">
              E-posta ile bagladigin Ascend hesabina bu cihazdan devam et.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="E-posta"
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-2xl outline-none transition-all"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Sifre"
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-2xl outline-none transition-all"
            onKeyDown={(event) => event.key === 'Enter' && void handleRestore()}
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => void handleRestore()}
            disabled={!email.trim() || password.length < 1 || isLoading}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-semibold hover:bg-black disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? 'Baglaniyor...' : 'Giris yap'} <ArrowRight size={18} />
          </button>
          <button
            onClick={onStartFresh}
            className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-semibold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} /> Yeni baslat
          </button>
        </div>
      </div>
    </div>
  );
}
