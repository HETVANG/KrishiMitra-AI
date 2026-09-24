import React, { Component, ErrorInfo, ReactNode } from 'react';
import { isWebGLAvailable } from '../utils/webglCheck';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorInfo: string | null;
}

export class AnimationErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: !isWebGLAvailable(),
    errorInfo: !isWebGLAvailable() ? 'WebGL is not supported on this device or browser.' : null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorInfo: error.message || 'Animation rendering failed.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[AnimationErrorBoundary] 3D canvas error caught gracefully:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      // Graceful default fallback: transparent container that doesn't obstruct UI
      return (
        <div className="w-full h-full min-h-[150px] flex items-center justify-center bg-emerald-950/5 dark:bg-dark-900/40 rounded-2xl p-4 text-center border border-emerald-900/10 dark:border-dark-800/20 pointer-events-none">
          <div className="text-xs text-gray-500 dark:text-dark-400 font-medium">
            Agricultural visual mode active
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
