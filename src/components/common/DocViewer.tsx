import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, History, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Document } from '../../types';

interface DocViewerProps {
  doc: Document | null;
  onClose: () => void;
}

export const DocViewer: React.FC<DocViewerProps> = ({ doc, onClose }) => {
  if (!doc) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white w-full max-w-4xl h-[80vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border-4 border-slate-900"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50">
            <div className="flex gap-6 items-center">
              <div className="w-16 h-16 bg-white rounded-3xl border-2 border-slate-900 flex items-center justify-center shadow-lg">
                <FileText className="w-8 h-8 text-polis-copper" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">{doc.title}</h3>
                <div className="flex gap-4 mt-1">
                  <span className="text-[10px] font-black uppercase text-polis-copper tracking-widest">{doc.type} • {doc.size}</span>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Обновлено: {doc.date}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-slate-200 rounded-2xl transition-all active:scale-95"
            >
              <X className="w-6 h-6 text-slate-900" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Main Text */}
            <div className="flex-1 overflow-y-auto p-10 markdown-body custom-scrollbar">
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown>{doc.content}</ReactMarkdown>
              </div>
            </div>

            {/* Sidebar / History */}
            <div className="w-72 bg-slate-50 border-l border-slate-100 p-8 overflow-y-auto hidden md:block">
              <div className="flex items-center gap-2 mb-6">
                <History className="w-4 h-4 text-polis-copper" />
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Архив Версий</span>
              </div>
              <div className="space-y-6">
                {doc.versions.map((v, i) => (
                  <div key={i} className="relative pl-6 border-l-2 border-slate-200 py-1">
                    <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-slate-300" />
                    <div className="text-[10px] font-black text-slate-900 mb-1">v{v.v}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase mb-2">{v.date}</div>
                    <p className="text-[10px] text-slate-600 font-medium leading-tight">{v.note}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-polis-green transition-all shadow-lg flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Скачать PDF
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
