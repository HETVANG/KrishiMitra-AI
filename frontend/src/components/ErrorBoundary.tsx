import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex items-center justify-center p-6 text-left">
          <div className="bg-white dark:bg-dark-900 border border-gray-150/40 dark:border-dark-800/40 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-5 relative">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-955/20 text-red-500 rounded-2xl flex items-center justify-center text-xl font-extrabold border border-red-100/50 dark:border-red-950">
              <AlertTriangle size={24} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-gray-805 dark:text-dark-50 tracking-tight">Application Crash Intercepted</h2>
              <p className="text-xs text-gray-505 dark:text-dark-400 leading-relaxed font-medium">
                KrishiMitra AI encountered an unexpected rendering error. This could be due to a corrupt local cache, session timeout, or system asset updates on Vercel.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-gray-50 dark:bg-dark-850 p-3.5 rounded-xl border border-gray-200/50 dark:border-dark-800/30 text-[10px] text-red-600 dark:text-red-400 font-mono overflow-auto max-h-[120px] whitespace-pre-wrap leading-tight">
                <strong>Error:</strong> {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <RotateCcw size={14} /> Clear Cache & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
