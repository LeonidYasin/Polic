import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  MessageSquare,
  LogOut,
  User as UserIcon,
  Bell,
  X,
  Trash2,
  Lock
} from "lucide-react";
import { signInWithPopup, signOut } from "firebase/auth";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";

// Components
import { LandingPage } from "./components/Landing/LandingPage";
import { AdminPanel } from "./components/Admin/AdminPanel";
import { ArionMessenger } from "./components/Citizen/ArionMessenger";

// Hooks & Constants
import { usePolisData } from "./hooks/usePolisData";

export default function App() {
  const { 
    user, 
    userData, 
    loading, 
    allUsers, 
    allPetitions, 
    allProfiles, 
    userNotifications,
    isFirebaseConfigured
  } = usePolisData();

  const [isAdminView, setIsAdminView] = useState(false);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const handleLogin = async () => {
    if (!isFirebaseConfigured) {
      alert("Firebase is not configured. Please set VITE_FIREBASE_API_KEY and other variables in the Settings menu.");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const isManagement = userData?.role === 'admin' || userData?.role === 'mediator' || user?.email === 'leonidyasin@gmail.com' || user?.email === 'globalleonstube@gmail.com';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05110c] flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 border-4 border-polis-copper rounded-full border-t-transparent animate-spin"
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans selection:bg-polis-copper selection:text-white ${isAdminView ? 'bg-slate-50' : 'bg-white'}`}>
      
      {!isFirebaseConfigured && (
        <div className="fixed top-0 left-0 right-0 z-[200] bg-red-600 text-white p-2 text-center text-[10px] font-black uppercase tracking-widest">
          Внимание: Firebase не настроен. Пожалуйста, добавьте API ключи в настройки (VITE_FIREBASE_API_KEY).
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 lg:p-8 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/80 backdrop-blur-xl border border-slate-200/50 p-2 lg:p-3 rounded-[2.5rem] shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-6 pl-4">
             <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsAdminView(false)}>
               <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white group-hover:bg-polis-green transition-all shadow-xl">
                 <Shield className="w-5 h-5" />
               </div>
               <div className="hidden sm:block">
                 <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">Polis</h1>
                 <p className="text-[8px] font-black uppercase text-polis-copper tracking-widest mt-0.5">Open Order Protocol</p>
               </div>
             </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 pr-1">
            {user ? (
              <div className="flex items-center gap-2 lg:gap-4">
                {isManagement && (
                  <button 
                    onClick={() => setIsAdminView(!isAdminView)}
                    className={`px-4 lg:px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                      isAdminView ? 'bg-polis-copper text-white border-polis-copper' : 'border-polis-copper text-polis-copper hover:bg-polis-copper/10'
                    }`}
                  >
                    {isAdminView ? 'Выйти из Админки' : 'Админ-панель'}
                  </button>
                )}

                <div className="relative">
                  <button 
                    onClick={() => setShowNotifPanel(!showNotifPanel)}
                    className={`p-3 lg:p-4 rounded-2xl bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition-all relative ${userNotifications.some(n => !n.read) ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                   >
                     <Bell className="w-5 h-5" />
                     {userNotifications.some(n => !n.read) && (
                       <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                     )}
                   </button>
                   <AnimatePresence>
                      {showNotifPanel && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden z-[110]"
                        >
                           <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase text-slate-400">Уведомления</span>
                              <button onClick={() => setShowNotifPanel(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                           </div>
                           <div className="max-h-96 overflow-y-auto">
                              {userNotifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-[10px] font-bold uppercase">Входящих нет</div>
                              ) : (
                                userNotifications.map(n => (
                                  <div key={n.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors relative group ${!n.read ? 'bg-indigo-50/30' : ''}`}>
                                     <div className="text-[11px] font-bold text-slate-800 mb-1">{n.title}</div>
                                     <div className="text-[10px] text-slate-600 leading-tight">{n.message}</div>
                                     <button onClick={() => deleteDoc(doc(db, 'notifications', n.id))} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                                        <Trash2 className="w-3 h-3" />
                                     </button>
                                  </div>
                                ))
                              )}
                           </div>
                        </motion.div>
                      )}
                   </AnimatePresence>
                </div>

                <button 
                  onClick={handleLogout}
                  className="p-3 lg:p-4 rounded-2xl bg-slate-900 text-white hover:bg-red-500 transition-all shadow-lg active:scale-95"
                >
                  <LogOut className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-3 lg:px-4 py-2 rounded-2xl">
                  <div className="hidden lg:block text-right">
                    <div className="text-[10px] font-black uppercase text-slate-900 leading-none">{userData?.displayName || user.displayName}</div>
                    <div className="text-[8px] font-black uppercase text-polis-copper tracking-widest mt-0.5">§ {userData?.meritPoints || 0} Merit</div>
                  </div>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black uppercase text-sm">
                      {user.displayName?.[0] || 'G'}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-slate-900 text-white px-6 py-2 rounded-full text-xs font-black uppercase hover:bg-polis-green transition-all shadow-lg active:scale-95"
              >
                Вход для Граждан
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {isAdminView ? (
          <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AdminPanel 
              allUsers={allUsers} 
              allPetitions={allPetitions} 
              allProfiles={allProfiles} 
              currentAdminUid={user?.uid || ''} 
            />
          </motion.div>
        ) : user ? (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
             {/* Dashboard View */}
             <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                   <div className="bg-slate-900 text-white p-10 rounded-[3rem] border-8 border-slate-200 relative overflow-hidden">
                      <div className="relative z-10">
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Добро пожаловать в Полис, {userData?.displayName || user.displayName}</h2>
                        <p className="text-slate-400 font-medium italic max-w-xl">Ваш текущий ранг — {userData?.role || 'Applicant'}. Начните взаимодействие с Арионом для получения первых задач.</p>
                      </div>
                      <div className="absolute top-0 right-0 p-10 opacity-10">
                        <Shield className="w-64 h-64" />
                      </div>
                   </div>

                   <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-white border-2 border-slate-100 p-6 rounded-[2.5rem] shadow-sm">
                        <div className="text-[10px] font-black uppercase text-polis-copper mb-1">Мерит (Points)</div>
                        <div className="text-3xl font-black text-slate-900 italic">§ {userData?.meritPoints || 0}</div>
                      </div>
                      <div className="bg-white border-2 border-slate-100 p-6 rounded-[2.5rem] shadow-sm">
                        <div className="text-[10px] font-black uppercase text-polis-copper mb-1">Репутация (Rep)</div>
                        <div className="text-3xl font-black text-slate-900 italic">{userData?.reputation || 0}%</div>
                      </div>
                      <div className="bg-white border-2 border-slate-100 p-6 rounded-[2.5rem] shadow-sm">
                        <div className="text-[10px] font-black uppercase text-polis-copper mb-1">Деяния (Deeds)</div>
                        <div className="text-3xl font-black text-slate-900 italic">{userData?.successfulDeeds || 0}</div>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="bg-polis-copper p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
                      <h4 className="text-xl font-black uppercase italic mb-4">Messenger Arion</h4>
                      <p className="text-xs font-medium opacity-80 mb-6 leading-relaxed italic">«Я помогу тебе найти своё место в Контуре и обрести вес в Агоре». — Арион 3.0</p>
                      <button 
                        onClick={() => setIsMessengerOpen(true)}
                        className="w-full py-4 bg-white text-polis-copper rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" /> Открыть Канал
                      </button>
                      <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-48 h-48" />
                      </div>
                   </div>

                   <div className="bg-white border-2 border-slate-900 p-8 rounded-[3rem] shadow-xl">
                      <h4 className="text-sm font-black uppercase italic mb-6 flex items-center justify-between">
                        <span>Активность</span>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      </h4>
                      <div className="space-y-4">
                         {userNotifications.length === 0 ? (
                           <div className="py-10 text-center text-[10px] font-black uppercase text-slate-300">Событий нет</div>
                         ) : (
                           userNotifications.slice(0, 3).map(n => (
                             <div key={n.id} className="flex gap-4 items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-polis-copper mt-1.5 shrink-0" />
                                <div className="text-[10px] font-bold text-slate-600 leading-tight">{n.message}</div>
                             </div>
                           ))
                         )}
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        ) : (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LandingPage onLogin={handleLogin} user={user} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messenger Drawer */}
      <ArionMessenger 
        isOpen={isMessengerOpen} 
        onClose={() => setIsMessengerOpen(false)} 
        userData={userData}
      />

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 bg-slate-50 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-30">
            <Shield className="w-6 h-6" />
            <span className="font-black uppercase text-[10px] tracking-widest italic">Polis Network © 2026</span>
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <a href="#" className="hover:text-polis-copper transition-colors">Documents</a>
            <a href="#" className="hover:text-polis-copper transition-colors">Treasury</a>
            <a href="#" className="hover:text-polis-copper transition-colors">Infrastructure</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
