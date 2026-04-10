import React, { useMemo, useState } from 'react';
import { CloudAlert, CloudCheck, CloudCog, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import { SessionSyncState } from '../types';

interface AccountPanelProps {
  accountEmail: string | null;
  onClaimAccount: (email: string, password: string) => Promise<string | null>;
  syncState: SessionSyncState;
  syncMessage: string | null;
  lastSyncedAt: number | null;
  onRetrySync: () => void;
}

const syncMeta: Record<
  SessionSyncState,
  {
    label: string;
    tone: string;
    icon: typeof CloudCheck;
  }
> = {
  idle: {
    label: 'Yerel oturum',
    tone: 'bg-slate-100 text-slate-600',
    icon: CloudCog,
  },
  syncing: {
    label: 'Senkronize ediliyor',
    tone: 'bg-amber-100 text-amber-700',
    icon: RefreshCw,
  },
  synced: {
    label: 'Hesaba yazıldı',
    tone: 'bg-emerald-100 text-emerald-700',
    icon: CloudCheck,
  },
  conflict_resolved: {
    label: 'Cihaz verileri birleştirildi',
    tone: 'bg-sky-100 text-sky-700',
    icon: CloudCog,
  },
  degraded: {
    label: 'Yerel modda devam ediyor',
    tone: 'bg-red-100 text-red-700',
    icon: CloudAlert,
  },
};

export default function AccountPanel({
  accountEmail,
  onClaimAccount,
  syncState,
  syncMessage,
  lastSyncedAt,
  onRetrySync,
}: AccountPanelProps) {
  const [email, setEmail] = useState(accountEmail ?? '');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const meta = syncMeta[syncState];
  const SyncIcon = meta.icon;

  const formattedLastSync = useMemo(() => {
    if (!lastSyncedAt) {
      return null;
    }

    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    }).format(lastSyncedAt);
  }, [lastSyncedAt]);

  if (accountEmail) {
    return (
      <div className="glass rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Bağlı hesap</p>
            <p className="text-xs text-slate-500">Bu ilerleme e-posta ile geri yüklenebilir.</p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">{accountEmail}</div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${meta.tone}`}>
              <SyncIcon size={14} className={syncState === 'syncing' ? 'animate-spin' : ''} />
              {meta.label}
            </div>
            {syncState === 'degraded' ? (
              <button onClick={onRetrySync} className="text-xs font-bold text-brand-600 hover:text-brand-700">
                Tekrar dene
              </button>
            ) : null}
          </div>

          <p className="text-xs leading-relaxed text-slate-500">
            {syncMessage ?? 'Bu cihazdaki ilerleme son yazılan hesap verisiyle birlikte korunur.'}
          </p>

          {formattedLastSync ? <p className="text-[11px] text-slate-400">Son başarılı eşitleme: {formattedLastSync}</p> : null}
        </div>
      </div>
    );
  }

  const handleClaim = async () => {
    setIsSaving(true);
    setStatus(null);
    const result = await onClaimAccount(email.trim(), password);
    setStatus(result ?? 'Hesabın bu cihazla bağlandı. Artık diğer cihazlarda geri yükleyebilirsin.');
    setIsSaving(false);
  };

  return (
    <div className="glass rounded-3xl p-6 space-y-4">
      <div>
        <p className="text-sm font-bold text-slate-900">Hesabını bağla</p>
        <p className="text-xs text-slate-500">İlerlemeni e-posta ile koru ve başka cihazda geri yükle.</p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 space-y-2">
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${meta.tone}`}>
          <SyncIcon size={14} className={syncState === 'syncing' ? 'animate-spin' : ''} />
          {meta.label}
        </div>
        <p className="text-xs leading-relaxed text-slate-500">
          {syncMessage ?? 'Hesap bağlandığında ilerlemen sunucuya da yazılır ve geri yüklenebilir.'}
        </p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="E-posta adresin"
            className="w-full rounded-2xl border-2 border-transparent bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <input
          type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="En az 6 karakter şifre"
            className="w-full rounded-2xl border-2 border-transparent bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500"
          />
      </div>

      <button
        onClick={() => void handleClaim()}
        disabled={!email.trim() || password.length < 6 || isSaving}
        className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
      >
        {isSaving ? 'Bağlanıyor...' : 'Hesabı e-posta ile bağla'}
      </button>

      {status ? <p className={`text-xs ${status.includes('bağlandı') ? 'text-emerald-600' : 'text-red-500'}`}>{status}</p> : null}
    </div>
  );
}
