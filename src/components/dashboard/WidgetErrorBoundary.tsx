import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  widgetId: string;
  widgetTitle: string;
  onReset?: () => void;
  onRemove?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WidgetErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[WidgetErrorBoundary] Error caught in widget "${this.props.widgetTitle}" (${this.props.widgetId}):`, error, errorInfo);
  }

  public handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-[#FFFDF5] border border-[#E8DCC0] rounded-2xl flex flex-col justify-between h-full min-h-[160px] text-[#2D2D24] shadow-xs">
          <div>
            <div className="flex items-center justify-between text-[#B85D36] mb-2">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Widget Fault Isolated</span>
              </div>
              <span className="text-[10px] bg-[#B85D36]/10 text-[#B85D36] font-mono px-2 py-0.5 rounded-md border border-[#B85D36]/20">
                Error Boundary
              </span>
            </div>
            <p className="text-xs font-medium text-[#2D2D24] mb-1">
              {this.props.widgetTitle} encountered a rendering exception.
            </p>
            <div className="bg-[#FAF9F5] p-2 rounded-lg border border-[#E5E5DE] font-mono text-[10px] text-[#8B7E66] max-h-16 overflow-y-auto break-all">
              {this.state.error?.message || 'Unknown runtime error occurred'}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#E8DCC0] flex items-center justify-between gap-2">
            <span className="text-[10px] text-[#8B7E66] flex items-center gap-1">
              <Bug className="w-3 h-3 text-[#B85D36]" /> Isolated from dashboard
            </span>
            <div className="flex items-center gap-1.5">
              {this.props.onRemove && (
                <button
                  onClick={this.props.onRemove}
                  className="px-2.5 py-1 rounded-lg text-xs text-[#B33A3A] hover:bg-[#FFF5F5] border border-[#B33A3A]/20 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Remove this widget"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              )}
              <button
                onClick={this.handleRetry}
                className="px-2.5 py-1 rounded-lg text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-medium transition-colors flex items-center gap-1 cursor-pointer"
                title="Retry rendering widget"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
