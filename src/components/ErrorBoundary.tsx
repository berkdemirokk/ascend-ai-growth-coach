import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const errorMessage =
        this.state.error?.message && this.state.error.message.length < 220
          ? this.state.error.message
          : 'Beklenmedik bir sorun oluştu. Sayfayı yeniden yükleyerek devam edebilirsin.';

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0f1115]">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-center space-y-6 border-2 border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-[1.5rem] flex items-center justify-center text-red-500 mx-auto">
              <AlertTriangle size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Bir hata oluştu</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{errorMessage}</p>
            </div>
            <button onClick={() => window.location.reload()} className="w-full duo-button bg-premium-slate text-white py-5 flex items-center justify-center gap-3 hover:bg-premium-black">
              Tekrar dene <RefreshCw size={18} />
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
