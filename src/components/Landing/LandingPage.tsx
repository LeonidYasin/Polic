import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, FileText, Library, Shield, Award, ChevronRight, Download, History, Users, Zap } from 'lucide-react';
import { Section, Card } from '../common/UI';
import { DocViewer } from '../common/DocViewer';
import { DOCUMENTS } from '../../constants/data';
import { Document } from '../../types';

interface LandingPageProps {
  onLogin: () => void;
  user: any;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, user }) => {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  return (
    <>
      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-[#05110c] text-white">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 flex">
             {[...Array(8)].map((_, i) => (
                <div key={i} className="flex-1 border-r border-polis-copper/30 h-full" />
             ))}
          </div>
          <div className="absolute inset-0 flex flex-col">
             {[...Array(8)].map((_, i) => (
                <div key={i} className="flex-1 border-b border-polis-copper/30 w-full" />
             ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-polis-copper/10 border border-polis-copper/30 rounded-full">
               <div className="w-2 h-2 rounded-full bg-polis-copper animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-polis-copper">Протокол Селекции Активен</span>
            </div>

            <h1 className="text-6xl md:text-[10vw] font-black mb-6 leading-[0.85] tracking-tighter uppercase italic">
              Когнитивный<br />
              <span className="text-polis-copper">Лабиринт</span>
            </h1>
            
            <p className="text-lg md:text-xl max-w-2xl mx-auto font-medium text-slate-400 italic mb-12">
              «Вход — это привилегия. Гражданство — это долг. Полис ищет созидателей нового Контура».
            </p>

            <div className="flex flex-col items-center gap-8">
               {!user ? (
                 <button 
                  onClick={onLogin} 
                  className="group relative px-12 py-6 bg-white text-slate-900 font-black text-xs uppercase tracking-[0.3em] hover:pr-16 transition-all"
                 >
                   <span>Пройти Испытание Отбора</span>
                   <ArrowRight className="absolute right-[-20%] group-hover:right-4 top-1/2 -translate-y-1/2 transition-all opacity-0 group-hover:opacity-100 w-5 h-5 text-polis-copper" />
                 </button>
               ) : (
                 <a href="#dashboard" className="bg-polis-copper text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-white hover:text-polis-green transition-all">
                    Перейти к Контуру <ArrowRight className="w-4 h-4" />
                 </a>
               )}
            </div>
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <Section id="vision" title="Видение" icon={Shield}>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
                От Платформы <br />к <span className="text-polis-copper">Протоколу</span>
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                Полис — это не просто сообщество, это живой алгоритм. 
                Мы автоматизируем справедливость через меритократию, где ваш голос весит столько же, сколько ваши деяния.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Card title="Isegoria" description="Равное право каждого гражданина на высказывание и участие в дискуссии." icon={Users} />
                <Card title="Kazan" description="Прозрачная казна, управляемая коллективным разумом и алгоритмами." icon={Shield} />
              </div>
            </div>
            <div className="relative">
               <div className="aspect-square bg-slate-100 rounded-[4rem] border-8 border-white shadow-2xl flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-polis-green/10 to-transparent" />
                  <Zap className="w-32 h-32 text-polis-copper animate-pulse" />
               </div>
               <div className="absolute -bottom-6 -right-6 p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl max-w-[200px]">
                  <div className="text-3xl font-black italic">7%</div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">Системный Вклад в Социальный Щит</div>
               </div>
            </div>
          </div>
        </Section>

        <Section id="docs" title="Библиотека Кодекса" icon={Library}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DOCUMENTS.map(doc => (
              <div 
                key={doc.id} 
                onClick={() => setSelectedDoc(doc)}
                className="bg-white border-2 border-slate-100 p-6 rounded-[2.5rem] hover:border-polis-copper transition-all group cursor-pointer active:scale-95 shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-polis-copper/10 transition-colors">
                  {doc.icon}
                </div>
                <h4 className="font-black uppercase italic text-sm mb-2 text-slate-900">{doc.title}</h4>
                <p className="text-[10px] text-slate-500 font-bold leading-tight mb-4">{doc.desc}</p>
                <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-400">
                  <span>{doc.type} • {doc.size}</span>
                  <Download className="w-3 h-3 group-hover:text-polis-copper" />
                </div>
              </div>
            ))}
          </div>
        </Section>
      </main>

      <DocViewer doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
    </>
  );
};
