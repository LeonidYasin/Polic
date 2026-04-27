import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, X, Sparkles, Loader2 } from 'lucide-react';
import { askArion } from '../../lib/arion';
import { ChatMessage, UserData } from '../../types';

interface ArionMessengerProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData | null;
}

export const ArionMessenger: React.FC<ArionMessengerProps> = ({ isOpen, onClose, userData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('arion_chat_history');
      return saved ? JSON.parse(saved) : [
        { role: 'arion', text: 'Приветствую, путник. Я Арион, цифровой медиатор Полиса. Я здесь, чтобы направить твой потенциал в нужное русло.' }
      ];
    } catch (e) {
      return [{ role: 'arion', text: 'Приветствую, путник. Я Арион, цифровой медиатор Полиса.' }];
    }
  });
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('arion_chat_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isSending) return;

    const userMsg: ChatMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const response = await askArion(text, userData?.role || 'applicant', {
        meritPoints: userData?.meritPoints || 0,
        reputation: userData?.reputation || 0,
        displayName: userData?.displayName || 'Путник'
      });
      
      const arionMsg: ChatMessage = {
        role: 'arion',
        text: response.reply,
        suggestions: response.suggestions
      };
      setMessages(prev => [...prev, arionMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'arion', text: 'Ошибка соединения с Контуром.' }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-[2.5rem] shadow-2xl border-4 border-slate-900 z-[100] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-polis-copper rounded-2xl flex items-center justify-center text-white shadow-lg shadow-polis-copper/20">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-black uppercase tracking-widest italic">Arion Oracle</div>
                <div className="text-[9px] font-bold text-polis-copper uppercase">System Mediator</div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 shadow-inner">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium ${
                  m.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none shadow-lg' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                }`}>
                  {m.text}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {m.suggestions.map((s, si) => (
                        <button
                          key={si}
                          onClick={() => handleSend(s.text)}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-3xl border border-slate-200 rounded-tl-none shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  <span className="text-[10px] font-black uppercase text-slate-400">Arion is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 bg-white border-t border-slate-100">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Спроси Ариона об Этическом Кодексе..."
                className="w-full pl-6 pr-14 py-4 bg-slate-100 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-all"
              />
              <button 
                onClick={() => handleSend()}
                disabled={isSending || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-slate-900 text-white rounded-xl hover:bg-polis-green transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2 px-1">
              <Sparkles className="w-3 h-3 text-polis-copper" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Powered by Algorithm Arion 3.0</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
