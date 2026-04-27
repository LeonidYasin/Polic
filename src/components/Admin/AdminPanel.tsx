import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Users, FileText, Zap, Brain, ShieldAlert, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserData, Petition, Profile } from '../../types';
import { EVOLUTION_LOG } from '../../constants/data';

interface AdminPanelProps {
  allUsers: UserData[];
  allPetitions: Petition[];
  allProfiles: Profile[];
  currentAdminUid: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ allUsers, allPetitions, allProfiles, currentAdminUid }) => {
  const [activeTab, setActiveTab ] = useState<'petitions' | 'users' | 'evolution' | 'synthetics' | 'ai_governance'>('petitions');

  const handlePetition = async (petitionId: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'petitions', petitionId), {
        status,
        moderatedBy: currentAdminUid,
        moderatedAt: serverTimestamp()
      });
      
      if (status === 'approved') {
        const pet = allPetitions.find(p => p.id === petitionId);
        if (pet) {
            // Upgrade user role logic here if needed
            await updateDoc(doc(db, 'users', pet.userId), {
                role: pet.path === 'master' ? 'actor' : 'participant' // Simplified logic
            });
        }
      }
    } catch (error) {
      console.error("Error handling petition:", error);
    }
  };

  return (
    <main className="pt-32 pb-20 px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-12 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">Центр Управления</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2 flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-polis-copper" /> Режим Магистра Активен
          </p>
        </div>
        <div className="flex bg-slate-100 p-2 rounded-2xl gap-2 overflow-x-auto max-w-full">
          {(['petitions', 'users', 'evolution', 'synthetics', 'ai_governance'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-white text-polis-green shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'petitions' ? 'Прошения' : tab === 'users' ? 'Граждане' : tab === 'evolution' ? 'Хроники' : tab === 'synthetics' ? 'Цех Синтеза' : 'ИИ-Сторож'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {activeTab === 'petitions' && (
           <div className="grid gap-6">
              {allPetitions.filter(p => p.status === 'pending').length === 0 ? (
                <div className="p-20 text-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
                  <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <div className="text-xl font-black text-slate-300 uppercase italic">Новых прошений нет</div>
                </div>
              ) : (
                allPetitions.filter(p => p.status === 'pending').map(petition => (
                  <motion.div 
                    key={petition.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white border-2 border-slate-900 p-8 rounded-[3rem] shadow-xl flex flex-col md:flex-row gap-8 items-start relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <FileText className="w-32 h-32" />
                    </div>
                    <div className="flex-1 relative z-10">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="px-3 py-1 bg-polis-copper text-white rounded-full text-[9px] font-black uppercase tracking-widest">{petition.path}</div>
                        <div className="text-xs font-bold text-slate-400 font-mono">ID: {petition.id.slice(0,8)}</div>
                      </div>
                      <h4 className="text-xl font-black text-slate-900 mb-2 uppercase italic">{petition.userName}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium italic">"{petition.message}"</p>
                      <div className="flex gap-4">
                        <button onClick={() => handlePetition(petition.id, 'approved')} className="bg-polis-green text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:scale-105 transition-all">
                          <CheckCircle className="w-4 h-4" /> Принять в Полис
                        </button>
                        <button onClick={() => handlePetition(petition.id, 'rejected')} className="bg-red-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:scale-105 transition-all">
                          <XCircle className="w-4 h-4" /> Отказать
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
           </div>
        )}

        {activeTab === 'users' && (
           <div className="bg-white border-2 border-slate-900 rounded-[3rem] overflow-hidden shadow-xl">
             <table className="w-full text-left">
               <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                 <tr>
                   <th className="p-6">Гражданин</th>
                   <th className="p-6">Ранг</th>
                   <th className="p-6">Мерит (§)</th>
                   <th className="p-6">Репутация</th>
                   <th className="p-6">Действия</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {allUsers.map(u => (
                   <tr key={u.uid} className="hover:bg-slate-50 transition-colors">
                     <td className="p-6">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 uppercase italic text-lg">{u.displayName[0]}</div>
                         <div>
                           <div className="font-black text-slate-900 uppercase italic text-sm">{u.displayName}</div>
                           <div className="text-[10px] text-slate-400 font-bold">{u.email}</div>
                         </div>
                       </div>
                     </td>
                     <td className="p-6">
                       <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest">{u.role}</span>
                     </td>
                     <td className="p-6 font-black text-slate-900 italic">§ {u.meritPoints}</td>
                     <td className="p-6">
                        <div className="flex items-center gap-2">
                           <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-polis-copper" style={{ width: `${u.reputation}%` }} />
                           </div>
                           <span className="text-[10px] font-black text-slate-900">{u.reputation}%</span>
                        </div>
                     </td>
                     <td className="p-6">
                       <button className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}

        {/* ... Other tabs Evolution, Synthetics, AI Governance ... */}
      </div>
    </main>
  );
};
