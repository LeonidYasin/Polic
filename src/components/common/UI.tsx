import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  id?: string;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ title, children, icon: Icon, id, className = "" }) => (
  <motion.section 
    id={id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`py-12 border-b border-slate-200 scroll-mt-20 ${className}`}
  >
    <div className="flex items-center gap-3 mb-6">
      {Icon && <Icon className="w-6 h-6 text-polis-copper" />}
      <h2 className="text-2xl font-bold tracking-tight text-polis-green uppercase">{title}</h2>
    </div>
    {children}
  </motion.section>
);

interface CardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, description, icon: Icon, className = "" }) => (
  <div className={`p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow ${className}`}>
    <Icon className="w-8 h-8 text-polis-copper mb-4" />
    <h3 className="font-bold text-lg mb-2">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
  </div>
);

interface BadgeProps {
  name: string;
  icon: string;
  desc: string;
  active?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ name, icon, desc, active = false }) => (
  <div className={`p-4 rounded-2xl border transition-all ${active ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-slate-50/50 border-slate-100 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100'}`}>
    <div className="text-2xl mb-2">{icon}</div>
    <div className="text-[10px] font-black uppercase text-indigo-900 mb-1">{name}</div>
    <div className="text-[9px] text-slate-500 font-medium leading-tight">{desc}</div>
  </div>
);
