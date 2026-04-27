import React from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class GlobalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      let friendlyMessage = "Арион зафиксировал аномалию в Контуре Развития. Не беспокойтесь, ваши данные в безопасности.";
      let errorCode = "UNKNOWN_ANOMALY";
      
      try {
        const errorMsg = this.state.error?.message || "";
        if (errorMsg.startsWith('{')) {
          const parsed = JSON.parse(errorMsg);
          if (parsed.error && parsed.error.includes("insufficient permissions")) {
             friendlyMessage = "Доступ заблокирован Системой Безопасности. Похоже, ваше текущее гражданство не позволяет выполнить это действие или сессия устарела.";
             errorCode = "FORBIDDEN_ACCESS";
          } else if (parsed.operationType) {
             friendlyMessage = `Критический сбой при выполнении операции: ${parsed.operationType}. Пожалуйста, попробуйте синхронизировать Контур заново.`;
             errorCode = `OP_FAIL_${parsed.operationType.toUpperCase()}`;
          }
        }
      } catch (e) {
        // Fallback to default
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-polis-green uppercase tracking-tighter">Системный Сбой</h1>
              <p className="text-slate-500 text-sm leading-relaxed px-4">
                {friendlyMessage}
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="bg-slate-900 rounded-2xl p-4 text-left overflow-auto max-h-40">
                <code className="text-[10px] text-polis-copper font-mono break-all whitespace-pre-wrap">
                  {this.state.error?.toString()}
                </code>
              </div>
            )}

            <div className="flex flex-col gap-3 py-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-polis-green text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-polis-green/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-polis-green/20"
              >
                <RefreshCcw className="w-4 h-4" /> Перезагрузить Контур
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-white text-slate-500 border border-slate-200 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" /> Вернуться на Главную
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Спецификация: {errorCode}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
