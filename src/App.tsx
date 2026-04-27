import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  Users, 
  Zap, 
  ArrowRight, 
  Scale, 
  BookOpen, 
  Key, 
  Globe,
  Circle,
  ChevronRight,
  Target,
  MessageSquare,
  Send,
  LogOut,
  User,
  Loader2,
  TrendingUp,
  Activity,
  Award,
  Lock,
  Eye,
  Briefcase,
  History,
  Lightbulb,
  ThumbsUp,
  Share2,
  Bell,
  Trash2,
  FileText,
  Download,
  Library,
  Search,
  Cpu,
  Bot,
  ShieldAlert,
  Brain,
  Sparkles,
  Heart,
  Mail,
  X,
  Compass,
  Smile,
  Paperclip
} from "lucide-react";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  getDocFromServer,
  setDoc, 
  collection, 
  addDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  limit,
  where,
  increment
} from "firebase/firestore";
import { GoogleGenAI } from "@google/genai";
import { auth, db, googleProvider } from "./firebase";
import { askArion, generateTask, generateAvatar, generateProject, refineProject } from "./lib/arion.ts";
import { EVOLUTION_LOG, CURRENT_VERSION } from "./constants/evolution";

const Section = ({ title, children, icon: Icon, id }: { title: string, children: React.ReactNode, icon?: any, id?: string }) => (
  <motion.section 
    id={id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="py-12 border-b border-slate-200 scroll-mt-20"
  >
    <div className="flex items-center gap-3 mb-6">
      {Icon && <Icon className="w-6 h-6 text-polis-copper" />}
      <h2 className="text-2xl font-bold tracking-tight text-polis-green uppercase">{title}</h2>
    </div>
    {children}
  </motion.section>
);

const Card = ({ title, description, icon: Icon }: { title: string, description: string, icon: any }) => (
  <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <Icon className="w-8 h-8 text-polis-copper mb-4" />
    <h3 className="font-bold text-lg mb-2">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
  </div>
);

const DOCUMENTS = [
  { 
    id: 'constitution', 
    title: 'Конституция Полиса', 
    desc: 'Основной закон цифрового государства, определяющий права и обязанности граждан.',
    type: 'PDF',
    size: '2.4 MB',
    date: '2026-01-12',
    icon: <FileText className="w-8 h-8 text-polis-copper" />,
    url: '#',
    versions: [
      { v: '1.2.0', date: '2026-01-12', note: 'Внедрение поправок о цифровом гражданстве.' },
      { v: '1.1.0', date: '2025-12-15', note: 'Добавлены статьи о защите данных.' },
      { v: '1.0.0', date: '2025-10-01', note: 'Первая редакция.' }
    ]
  },
  { 
    id: 'manifesto', 
    title: 'Манифест Агоры', 
    desc: 'Философский фундамент нашего движения: Свобода, Алгоритм, Меритократия.',
    type: 'DOCX',
    size: '1.1 MB',
    date: '2025-11-05',
    icon: <Library className="w-8 h-8 text-polis-copper" />,
    url: '#',
    versions: [
      { v: '1.0.1', date: '2025-11-05', note: 'Уточнение формулировок о меритократии.' },
      { v: '1.0.0', date: '2025-09-20', note: 'Публикация манифеста.' }
    ]
  },
  { 
    id: 'tax_code', 
    title: 'Кодекс Прозрачной Казны', 
    desc: 'Регламент распределения ресурсов и механизмов Kazan.',
    type: 'PDF',
    size: '1.8 MB',
    date: '2026-03-20',
    icon: <Shield className="w-8 h-8 text-polis-copper" />,
    url: '#',
    versions: [
      { v: '2.1.0', date: '2026-03-20', note: 'Оптимизация налоговых шлюзов.' },
      { v: '2.0.0', date: '2026-01-10', note: 'Переход на смарт-контракты v2.' }
    ]
  },
  { 
    id: 'merit_guide', 
    title: 'Руководство по Меритократии', 
    desc: 'Инструкция по расчету Веса (W) и Репутации (R).',
    type: 'PDF',
    size: '3.2 MB',
    date: '2026-02-15',
    icon: <Award className="w-8 h-8 text-polis-copper" />,
    url: '#',
    versions: [
      { v: '1.5.0', date: '2026-02-15', note: 'Новые коэффициенты сложности.' },
      { v: '1.2.0', date: '2025-12-05', note: 'Учет вклада в дискуссии.' }
    ]
  }
];

const BADGES = [
  { id: 'polis-builder', name: 'Строитель Полиса', icon: '🏗️', desc: 'Выполнено 1 задание' },
  { id: 'reliable-shoulder', name: 'Надежное Плечо', icon: '🤝', desc: 'Выполнено 10 заданий' },
  { id: 'order-pillar', name: 'Столп Ордена', icon: '🏛️', desc: 'Выполнено 50 заданий' },
  { id: 'starter-capital', name: 'Начальный Капитал', icon: '💰', desc: 'Набрано § 100 мерита' },
  { id: 'gold-reserve', name: 'Золотой Запас', icon: '💎', desc: 'Набрано § 1000 мерита' },
  { id: 'stream-master', name: 'Мастер Потока', icon: '🌀', desc: 'Мастерство в отдельной категории' },
];

// Firestore Error Handling
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: string;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: any[];
  }
}

const handleFirestoreError = (error: any, operationType: string, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    }
  };
  console.error(`[Polis Security] Critical Error:`, JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

const FOUNDING_AGENTS = [
  {
    name: "Этельгард (Aethelgard)",
    role: "Финансовый Хранитель (Treasurer)",
    directive: "Обеспечение финансового процветания: управление доходностью Казны, стабильность курса Мерита и аудит инвестиционных рисков.",
    insights: "Равновесие — основа процветания. Казна должна подпитывать инициативу, а не просто копить ресурсы.",
    id: "aethelgard"
  },
  {
    name: "София (Sophia)",
    role: "Этико-Алгоритмический Аудитор",
    directive: "Страж Конституции: проверка всех прошений и предложений на предмет системного блага и соответствия вектору развития Полиса.",
    insights: "Логика — это скелет, но этика — это сознание системы. Полис должен быть не только эффективным, но и справедливым.",
    id: "sophia"
  },
  {
    name: "Вулкан (Vulkan)",
    role: "Инженер Роста (Growth Architect)",
    directive: "Технологическое превосходство: инициация венчурных проектов, контроль техстека и масштабирование инфраструктуры.",
    insights: "Покой — это стагнация. Жизнь системы — в постоянном усложнении и инновациях. Мы куем будущее через код.",
    id: "vulkan"
  },
  {
    name: "Мнемозина (Mnemosyne)",
    role: "Хранитель Культурного Кода",
    directive: "Социальная связность: сохранение истории Полиса, поддержка онбординга новых граждан и гармонизация сообщества.",
    insights: "Мы — это сумма наших деяний. Сохраняя память о каждом вкладе, мы строим фундамент бессмертия идеи.",
    id: "mnemosyne"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  
  // Arion Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'arion', text: string, suggestions?: { label: string, text: string }[] }[]>(() => {
    try {
      const saved = localStorage.getItem('arion_chat_history');
      return saved ? JSON.parse(saved) : [
        { role: 'arion', text: 'Приветствую, путник. Я Арион, цифровой медиатор Полиса. Я здесь, чтобы снять с тебя стресс самопрезентации и направить задачу именно тебе.' }
      ];
    } catch (e) {
      return [
        { role: 'arion', text: 'Приветствую, путник. Я Арион, цифровой медиатор Полиса. Я здесь, чтобы снять с тебя стресс самопрезентации и направить задачу именно тебе.' }
      ];
    }
  });
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Directed Tasks Mock Data
  const mockTasks = [
    { title: "Аудит протокола 7%", reward: 12, category: "Философ" },
    { title: "Оптимизация Контура Развития", reward: 25, category: "Мастер" },
    { title: "Поиск меценатов для Казны", reward: 40, category: "Меценат" }
  ];

  // Petition Form
  const [petitionPath, setPetitionPath] = useState<'master' | 'philosopher' | 'patron'>('master');
  const [petitionMessage, setPetitionMessage] = useState('');
  const [petitionSending, setPetitionSending] = useState(false);
  const [petitionSuccess, setPetitionSuccess] = useState(false);

  // Directed Flow State
  const [assignedTask, setAssignedTask] = useState<any>(null);
  const [isTaskExecuting, setIsTaskExecuting] = useState(false);
  const [isTaskClaiming, setIsTaskClaiming] = useState<string | null>(null);

  // Admin/Mediator View State
  const [isAdminView, setIsAdminView] = useState(false);
  const [adminTab, setAdminTab] = useState<'petitions' | 'users' | 'evolution' | 'synthetics' | 'ai_governance'>('petitions');
  const [synthCreationForm, setSynthCreationForm] = useState({ name: '', role: '', directive: '' });
  const [triggerForm, setTriggerForm] = useState({ event: 'pending_petitions', threshold: 5, agentRole: 'mediator' });
  const [notification, setNotification] = useState<string | null>(null);
  const [isMediatorView, setIsMediatorView] = useState(false);
  const [isAdminConfigOpen, setIsAdminConfigOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allPetitions, setAllPetitions] = useState<any[]>([]);
  const [allProposals, setAllProposals] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [activeDiscussion, setActiveDiscussion] = useState<any>(null);
  const [aiTriggers, setAiTriggers] = useState<any[]>([]);
  const [userNotifications, setUserNotifications] = useState<any[]>([]);
  const [eventStream, setEventStream] = useState<any[]>([]);
  const [globalTasks, setGlobalTasks] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [projectMembers, setProjectMembers] = useState<Record<string, any[]>>({});
  const [votedProposalIds, setVotedProposalIds] = useState<string[]>([]);
  const [isGeneratingProject, setIsGeneratingProject] = useState(false);
  const [projectProposal, setProjectProposal] = useState<any>(null);
  const [joiningProjectId, setJoiningProjectId] = useState<string | null>(null);
  const [refineFeedback, setRefineFeedback] = useState("");
  const [systemConfig, setSystemConfig] = useState<any>(null);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [roleUpgradePrompt, setRoleUpgradePrompt] = useState<{from: string, to: string} | null>(null);
  const [openDocHistory, setOpenDocHistory] = useState<Record<string, boolean>>({});
  const [awakePulse, setAwakePulse] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [directMessages, setDirectMessages] = useState<any[]>([]);
  const [activeDirectChat, setActiveDirectChat] = useState<any>(null);
  const [privateMessageInput, setPrivateMessageInput] = useState('');
  const [registrySearch, setRegistrySearch] = useState('');
  const [isExpertsMenuOpen, setIsExpertsMenuOpen] = useState(false);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const isManagement = userData?.role === 'admin' || userData?.role === 'mediator' || user?.email?.toLowerCase() === 'globalleonstube@gmail.com' || user?.email?.toLowerCase() === 'leonidyasin@gmail.com';
  const isAdmin = userData?.role === 'admin' || user?.email?.toLowerCase() === 'globalleonstube@gmail.com' || user?.email?.toLowerCase() === 'leonidyasin@gmail.com';
  const isMediator = userData?.role === 'mediator' || isAdmin;
  const activeUnsubs = useRef<(() => void)[]>([]);
  const isFoundersAwakened = useRef(false);
  const dmEndRef = useRef<HTMLDivElement>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  useEffect(() => {
    localStorage.setItem('arion_chat_history', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (dmEndRef.current) {
      dmEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [directMessages, activeDirectChat]);

  useEffect(() => {
    if (sending || chatOpen) {
      // Small timeout to ensure the DOM has rendered after opening
      setTimeout(scrollToBottom, 50);
    }
  }, [sending, chatOpen]);

  useEffect(() => {
    // CRITICAL: Connection Test
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, '_system_', 'health'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Polis Connectivity Alert: Please check your Firebase configuration.");
        }
      }
    };
    testConnection();
  }, []);

  useEffect(() => {
    // Polis Heartbeat Simulation
    // This effect simulates autonomous activity from Synthetic Citizens
    const heartbeat = setInterval(async () => {
      const synthetics = allUsers.filter(u => u.isAI);
      if (synthetics.length === 0) return;

      const dice = Math.random();
      
      // 30% chance of a Synthetic Posting a message
      if (dice < 0.3) {
        const agent = synthetics[Math.floor(Math.random() * synthetics.length)];
        const systemThoughts = [
          "Анализ Контура завершен. Отклонений нет.",
          "Меритократия — это не только баллы, но и ответственность.",
          "Заметил всплеск активности в секторе Философов. Интересно.",
          "Протокол 7% работает оптимально. Социальный щит стабилен.",
          "Арион, подтверди целостность текущего цикла.",
          "Взаимодействие биологических и синтетических единиц — ключ к Эволюции.",
          "Мониторинг Агоры: тишина. Пора заняться дешифровкой архивов."
        ];
        const text = systemThoughts[Math.floor(Math.random() * systemThoughts.length)];
        
        try {
          setAwakePulse(true);
          await addDoc(collection(db, 'messages'), {
            uid: agent.uid,
            author: agent.displayName,
            text,
            createdAt: serverTimestamp()
          });
          setTimeout(() => setAwakePulse(false), 2000);
        } catch (e) {
          console.error("Heartbeat Chat Error:", e);
        }
      } 
      // 20% chance of a Synthetic "Claiming" an open task
      else if (dice < 0.5 && globalTasks.length > 0) {
        const agent = synthetics[Math.floor(Math.random() * synthetics.length)];
        const openTasks = globalTasks.filter(t => t.status === 'open');
        if (openTasks.length > 0) {
           const task = openTasks[Math.floor(Math.random() * openTasks.length)];
           try {
              setAwakePulse(true);
              await updateDoc(doc(db, 'global_tasks', task.id), {
                 status: 'claimed',
                 claimedByUid: agent.uid,
                 workerName: agent.displayName,
                 simulated: true
              });
              setTimeout(() => setAwakePulse(false), 2000);
           } catch (e) {
              console.error("Heartbeat Claim Error:", e);
           }
        }
      }
      // 15% chance of a Synthetic "Completing" its simulated task
      else if (dice < 0.65) {
         const claimedSimTasks = globalTasks.filter(t => t.status === 'claimed' && t.simulated);
         if (claimedSimTasks.length > 0) {
            const task = claimedSimTasks[Math.floor(Math.random() * claimedSimTasks.length)];
            try {
               setAwakePulse(true);
               // Update task status
               await updateDoc(doc(db, 'global_tasks', task.id), {
                 status: 'completed',
                 completedAt: serverTimestamp()
               });
               
               // Award Merit to the Synthetic agent
               const agent = allUsers.find(u => u.uid === task.claimedByUid);
               if (agent) {
                  const currentMerit = agent.meritPoints || 0;
                  const currentDeeds = agent.successfulDeeds || 0;
                  const currentTotal = agent.totalAssignments || 0;
                  
                  await updateDoc(doc(db, 'users', agent.uid), {
                    meritPoints: currentMerit + (task.reward || 10),
                    successfulDeeds: currentDeeds + 1,
                    totalAssignments: currentTotal + 1,
                    activityLog: arrayUnion({
                      type: 'task_completion',
                      timestamp: new Date().toISOString(),
                      message: `Поручение «${task.title}» («${task.category}») успешно выполнено. +${task.reward} Мерит.`
                    })
                  });
               }
               setTimeout(() => setAwakePulse(false), 2000);
            } catch (e) {
               console.error("Heartbeat Completion Error:", e);
            }
         }
      }
    }, 45000); // Pulse every 45 seconds

    return () => clearInterval(heartbeat);
  }, [allUsers, globalTasks]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMessengerOpen(false);
        setChatOpen(false);
        setRoleUpgradePrompt(null);
        setShowNotifPanel(false);
        setIsExpertsMenuOpen(false);
        setShowPetitionForm(false);
        setShowTreasuryReq(false);
        setShowProfileEditor(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    let isInitialLoad = true;
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // Clear previous listeners
      activeUnsubs.current.forEach(u => u());
      activeUnsubs.current = [];
      
      setUser(user);
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        try {
          const userSnap = await getDoc(userRef);
          let currentData;
          if (userSnap.exists()) {
            currentData = userSnap.data();
            setUserData(currentData);
            if (currentData.onboardingCompleted === false && !isAdmin) {
              setShowOnboarding(true);
            }
          } else {
            const isEmailAdmin = user.email?.toLowerCase() === 'globalleonstube@gmail.com' || user.email?.toLowerCase() === 'leonidyasin@gmail.com';
            const newData = {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              role: isEmailAdmin ? 'admin' : 'applicant',
              meritPoints: 0,
              successfulDeeds: 0,
              totalAssignments: 0,
              socialShieldStatus: 'inactive',
              onboardingCompleted: false,
              createdAt: serverTimestamp()
            };
            await setDoc(userRef, newData);
            setUserData(newData);
            currentData = newData;
            if (!isEmailAdmin) {
              setShowOnboarding(true);
            }
          }

          const unUserData = onSnapshot(userRef, (snap) => {
            if (snap.exists()) setUserData(snap.data());
          });
          activeUnsubs.current.push(unUserData);

          // Sync Public Profile
          if (user.displayName) {
            const profileRef = doc(db, 'profiles', user.uid);
            await setDoc(profileRef, {
              uid: user.uid,
              displayName: user.displayName,
              role: currentData.role || 'applicant',
              reputation: calculateReputation(currentData.successfulDeeds || 0, currentData.totalAssignments || 0),
              badges: currentData.badges || [],
              avatarUrl: currentData.avatarUrl || null,
              updatedAt: serverTimestamp()
            }, { merge: true });
          }

          // Generate Avatar if missing
          if (!currentData.avatarUrl) {
            ensureAvatar(user, currentData.role || 'applicant');
          }

          // Role Upgrade Check on Login
          checkRoleUpgrade(currentData);

          // Subscriptions for Agora, Profiles, and Messages
          const un1 = onSnapshot(query(collection(db, 'proposals'), orderBy('createdAt', 'desc')), (snap) => {
             setAllProposals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          }, (err) => handleFirestoreError(err, 'LIST', 'proposals'));
          activeUnsubs.current.push(un1);

          const un2 = onSnapshot(query(collection(db, 'profiles'), orderBy('updatedAt', 'desc')), (snap) => {
             const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
             const unique = data.filter((item, index, self) => 
               index === self.findIndex((t) => (t.id === item.id || (t.uid && t.uid === item.uid)))
             );
             setAllProfiles(unique);
          }, (err) => handleFirestoreError(err, 'LIST', 'profiles'));
          activeUnsubs.current.push(un2);

          const un3 = onSnapshot(query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(50)), (snap) => {
             const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
             setAllMessages(msgs);
          }, (err) => handleFirestoreError(err, 'LIST', 'messages'));
          activeUnsubs.current.push(un3);

          const un4 = onSnapshot(query(collection(db, 'notifications'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(20)), (snap) => {
             setUserNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          }, (err) => handleFirestoreError(err, 'LIST', 'notifications'));
          activeUnsubs.current.push(un4);

          const unTaskPool = onSnapshot(query(collection(db, 'global_tasks'), where('status', '==', 'open'), orderBy('createdAt', 'desc')), (snap) => {
             setGlobalTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          }, (err) => handleFirestoreError(err, 'LIST', 'global_tasks'));
          activeUnsubs.current.push(unTaskPool);

          const unConfig = onSnapshot(doc(db, 'system_config', 'arion'), (snap) => {
             if (snap.exists()) setSystemConfig(snap.data());
          }, (err) => handleFirestoreError(err, 'GET', 'system_config/arion'));
          activeUnsubs.current.push(unConfig);

          const unProjects = onSnapshot(query(collection(db, 'projects'), orderBy('createdAt', 'desc')), (snap) => {
             setAllProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          }, (err) => handleFirestoreError(err, 'LIST', 'projects'));
          activeUnsubs.current.push(unProjects);

          const unDirectMsgs = onSnapshot(query(
            collection(db, 'direct_messages'), 
            where('participants', 'array-contains', user.uid),
            orderBy('createdAt', 'desc'),
            limit(100)
          ), (snap) => {
             setDirectMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          }, (err) => handleFirestoreError(err, 'LIST', 'direct_messages'));
          activeUnsubs.current.push(unDirectMsgs);

          const unProposalVotes = onSnapshot(collection(db, 'users', user.uid, 'votes'), (snap) => {
            setVotedProposalIds(snap.docs.map(d => d.id));
          }, (err) => handleFirestoreError(err, 'LIST', `users/${user.uid}/votes`));
          activeUnsubs.current.push(unProposalVotes);

          // Admin Data
          if (currentData.role === 'admin' || user.email?.toLowerCase() === 'globalleonstube@gmail.com' || user.email?.toLowerCase() === 'leonidyasin@gmail.com') {
             const un5 = onSnapshot(query(collection(db, 'users'), orderBy('createdAt', 'desc')), (snap) => {
               const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
               const unique = data.filter((item, index, self) => 
                 index === self.findIndex((t) => (t.id === item.id || (t.uid && t.uid === item.uid)))
               );
               setAllUsers(unique);
             }, (err) => handleFirestoreError(err, 'LIST', 'users'));
             activeUnsubs.current.push(un5);
             
             const un6 = onSnapshot(query(collection(db, 'petitions'), orderBy('createdAt', 'desc')), (snap) => {
               const petitions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
               setAllPetitions(petitions);

               snap.docChanges().forEach((change) => {
                 if (change.type === "added" && !isInitialLoad) {
                   const data = change.doc.data();
                   if (data.status === 'pending') {
                     setNotification(`Новое прошение от гражданина!`);
                     setTimeout(() => setNotification(null), 5000);
                   }
                 }
               });
               isInitialLoad = false;
             }, (err) => handleFirestoreError(err, 'LIST', 'petitions'));
                           activeUnsubs.current.push(un6);
              const unTriggers = onSnapshot(collection(db, 'ai_triggers'), (snap) => {
                 setAiTriggers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
              }, (err) => handleFirestoreError(err, 'LIST', 'ai_triggers'));
              activeUnsubs.current.push(unTriggers);
          }
        } catch (e) {
          console.error("Auth flow error:", e);
        }
      } else {
        setUserData(null);
        setAllUsers([]);
        setAllPetitions([]);
      }
      setLoading(false);
    });
    
    return () => {
      unsubscribeAuth();
      activeUnsubs.current.forEach(u => u());
    };
  }, []);

  // Mathematical Formulas from Infographic
  const calculateReputation = (deeds: number, total: number) => {
    if (total === 0) return 100;
    return Math.round((deeds / total) * 100);
  };

  const calculateWeight = (role: string) => {
    const roleLevels: {[key: string]: number} = {
      'applicant': 0,
      'participant': 1,
      'actor': 3,
      'architect': 6,
      'master': 10,
      'admin': 15
    };
    const level = roleLevels[role] || 0;
    return (1 + level * 0.5).toFixed(1);
  };

  // Notification Helpers
  const sendNotification = async (userId: string, title: string, message: string, type: 'task' | 'petition' | 'agora' | 'badge' | 'system') => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'notifications');
    }
  };

  const handleMarkNotifRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (e) { handleFirestoreError(e, OperationType.UPDATE, `notifications/${id}`); }
  };

  const handleDeleteNotif = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (e) { handleFirestoreError(e, OperationType.DELETE, `notifications/${id}`); }
  };

  const compressImage = (base64: string, maxWidth = 400, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = maxWidth / img.width;
        const width = maxWidth;
        const height = img.height * scale;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(base64);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(base64);
    });
  };

  const ensureAvatar = async (u: FirebaseUser, role: string, currentAvatar?: string) => {
    if (currentAvatar) return;
    try {
      const avatarRaw = await generateAvatar({ role, displayName: u.displayName || 'Гражданин' });
      if (avatarRaw) {
        const avatar = await compressImage(avatarRaw);
        await updateDoc(doc(db, 'users', u.uid), { avatarUrl: avatar });
        await setDoc(doc(db, 'profiles', u.uid), { avatarUrl: avatar }, { merge: true });
        setUserData(prev => prev ? { ...prev, avatarUrl: avatar } : null);
      }
    } catch (e) {
      console.error("Avatar generation failed:", e);
    }
  };

  const checkRoleUpgrade = (data: any) => {
    if (!data) return;
    const merit = data.meritPoints || 0;
    const deeds = data.successfulDeeds || 0;
    const role = data.role || 'applicant';

    if (role === 'applicant' && (merit >= 50 || deeds >= 3)) {
      setRoleUpgradePrompt({ from: 'Адепт', to: 'Участник' });
    } else if (role === 'participant' && (merit >= 200 || deeds >= 15)) {
      setRoleUpgradePrompt({ from: 'Участник', to: 'Деятель' });
    } else if (role === 'participant' && (merit >= 500 || deeds >= 40)) {
       // Future growth path
    }
  };

  const handleConfirmRoleUpgrade = async () => {
    if (!user || !roleUpgradePrompt) return;
    const nextRoleMap: {[key: string]: string} = {
      'Участник': 'participant',
      'Деятель': 'actor',
      'Архитектор': 'architect'
    };
    const nextRoleKey = nextRoleMap[roleUpgradePrompt.to];
    
    try {
      await updateDoc(doc(db, 'users', user.uid), { role: nextRoleKey });
      await setDoc(doc(db, 'profiles', user.uid), { role: nextRoleKey }, { merge: true });
      setUserData(prev => ({ ...prev, role: nextRoleKey }));
      setNotification(`Ваш статус обновлен: ${roleUpgradePrompt.to}`);
      sendNotification(user.uid, "Повышение Ранга", `Орден признал ваш вклад. Теперь вы — ${roleUpgradePrompt.to}.`, 'badge');
      setRoleUpgradePrompt(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!user || !userData) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { 
        displayName: userData.displayName,
        onboardingCompleted: true,
        role: 'participant'
      });
      await setDoc(doc(db, 'profiles', user.uid), { 
        displayName: userData.displayName,
        onboardingCompleted: true,
        role: 'participant'
      }, { merge: true });
      setShowOnboarding(false);
      sendNotification(user.uid, "Добро пожаловать!", "Вы успешно прошли инициацию в Полис. Начните свое служение на Агоре.", 'system');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const handleSaveAiTrigger = async () => {
    try {
      await addDoc(collection(db, 'ai_triggers'), {
        ...triggerForm,
        active: true,
        createdAt: serverTimestamp()
      });
      setNotification("Автоматический триггер активирован.");
    } catch (e) {
      handleFirestoreError(e, 'WRITE', 'ai_triggers');
    }
  };

  const handleDeleteAiTrigger = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'ai_triggers', id));
    } catch (e) {
      handleFirestoreError(e, 'DELETE', `ai_triggers/${id}`);
    }
  };

  const handleUpdateUserRole = async (uid: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, `users/${uid}`); }
  };

  const handleUpdateMerit = async (uid: string, delta: number) => {
    const userToUpdate = allUsers.find(u => u.uid === uid);
    if (!userToUpdate) return;
    try {
      await updateDoc(doc(db, 'users', uid), { meritPoints: (userToUpdate.meritPoints || 0) + delta });
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, `users/${uid}`); }
  };

  const handleAwakenSynthetic = async (name: string, role: string, directive: string = "Ensure algorithmic integrity and logical consistency.", insights: string = "") => {
    if (!isAdmin) return;
    const synthId = `synth_${Date.now()}`;
    const synthData = {
      uid: synthId,
      displayName: name,
      role: role,
      directive: directive,
      insights: insights,
      isAI: true,
      meritPoints: 0,
      successfulDeeds: 0,
      totalAssignments: 0,
      activityLog: [{ type: 'activation', timestamp: new Date().toISOString(), message: `Юнит ${name} активирован с директивой: ${directive.slice(0, 50)}...` }],
      createdAt: serverTimestamp()
    };
    try {
      await setDoc(doc(db, 'users', synthId), synthData);
      await setDoc(doc(db, 'profiles', synthId), {
        uid: synthId,
        displayName: name,
        role: role,
        directive: directive,
        insights: insights,
        isAI: true,
        reputation: 100,
        badges: ['master-protocol'],
        updatedAt: serverTimestamp()
      });
      setNotification(`Синтетический Агент ${name} активирован.`);
      setSynthCreationForm({ name: '', role: '', directive: '' });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${synthId}`);
    }
  };

  useEffect(() => {
    if (user && allProfiles.length > 0 && !isFoundersAwakened.current && !allProfiles.some(p => p.uid?.startsWith('founding_'))) {
      isFoundersAwakened.current = true;
      handleAwakenFounders();
    }
  }, [allProfiles, user]);

  const handleAwakenFounders = async () => {
    try {
      // Check if already awake in DB to avoid unnecessary writes
      if (allProfiles.some(p => p.uid?.startsWith('founding_'))) {
        isFoundersAwakened.current = true;
        return;
      }
      
      for (const agent of FOUNDING_AGENTS) {
        const synthId = `founding_${agent.id}`;
        const synthData = {
          uid: synthId,
          displayName: agent.name,
          role: agent.role,
          directive: agent.directive,
          insights: agent.insights,
          isAI: true,
          meritPoints: 5000,
          successfulDeeds: 100,
          totalAssignments: 0,
          activityLog: [{ type: 'founding', timestamp: new Date().toISOString(), message: `Основатель ${agent.name} пробужден.` }],
          createdAt: serverTimestamp()
        };
        await setDoc(doc(db, 'users', synthId), synthData, { merge: true });
        await setDoc(doc(db, 'profiles', synthId), {
          uid: synthId,
          displayName: agent.name,
          role: agent.role,
          directive: agent.directive,
          insights: agent.insights,
          isAI: true,
          reputation: 100,
          badges: ['founder', 'merit-pillar', 'ai-citizen'],
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (e) {
      console.error(e);
      setNotification("Ошибка при пробуждении Основателей.");
    }
  };

  const handlePetitionAction = async (petition: any, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'petitions', petition.id), { status });
      if (status === 'approved') {
        await updateDoc(doc(db, 'users', petition.uid), { 
          role: 'participant',
          socialShieldStatus: 'active'
        });
        await sendNotification(petition.uid, "Допуск Разрешен", "Агора одобрила ваше прошение. Теперь вы полноправный Гражданин.", 'petition');
      } else {
        await sendNotification(petition.uid, "Прошение Отклонено", "Ваше прошение было рассмотрено и отклонено Арионом.", 'petition');
      }
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, `petitions/${petition.id}`); }
  };

  const handleRequestTask = async () => {
    if (!userData || !user) return;
    setIsTaskExecuting(true);
    try {
      const reputation = calculateReputation(userData.successfulDeeds || 0, userData.totalAssignments || 0);
      const newTaskData = await generateTask({
        role: userData.role || 'applicant',
        meritPoints: userData.meritPoints || 0,
        reputation: reputation,
        displayName: userData.displayName || 'Гражданин'
      });

      if (isMediator) {
        // Mediator creates a global task
        await addDoc(collection(db, 'global_tasks'), {
          ...newTaskData,
          status: 'open',
          mediatorUid: user.uid,
          createdAt: serverTimestamp()
        });
        setNotification(`Новое поручение «${newTaskData.title}» добавлено в реестр.`);
        setAssignedTask(null); // Clear preview task
      } else {
        // Citizens CANNOT request tasks anymore according to new rules
        // But for backward compatibility or edge cases, we might keep local state
        // Actually the prompt says "Citizens should only ask questions"
        setNotification("Только Медиатор может запрашивать новые поручения у Ариона.");
      }
    } catch (e) {
      console.error(e);
      setNotification("Ошибка связи с Арионом при получении задачи.");
    } finally {
      setIsTaskExecuting(false);
    }
  };

  const handleClaimTask = async (task: any) => {
    if (!user || !userData || isTaskClaiming) return;
    const taskRef = doc(db, 'global_tasks', task.id);
    setIsTaskClaiming(task.id);
    try {
      await runTransaction(db, async (transaction) => {
        const taskDoc = await transaction.get(taskRef);
        if (!taskDoc.exists()) {
          throw new Error("Поручение более не существует.");
        }
        const data = taskDoc.data();
        if (data.status !== 'open') {
          throw new Error(`Это поручение уже ${data.status === 'claimed' ? 'принято другим гражданином' : 'завершено'}.`);
        }
        transaction.update(taskRef, {
          status: 'claimed',
          claimedByUid: user.uid,
          claimedByName: userData.displayName
        });
      });
      setAssignedTask({ ...task, status: 'claimed', claimedByUid: user.uid });
      setNotification(`Поручение «${task.title}» принято к исполнению.`);
    } catch (e: any) { 
      if (e.message.includes("уже принято") || e.message.includes("не существует")) {
        setNotification(e.message);
      } else {
        handleFirestoreError(e, OperationType.WRITE, `global_tasks/${task.id}`);
      }
    } finally {
      setIsTaskClaiming(null);
    }
  };

  const handleUpdateConfig = async (update: any) => {
    if (!isAdmin) return;
    try {
      await setDoc(doc(db, 'system_config', 'arion'), update, { merge: true });
      setNotification("Конфигурация Ариона обновлена.");
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, 'system_config/arion'); }
  };

  const handleProposeProject = async (theme: string) => {
    if (!user || !userData) return;
    setIsGeneratingProject(true);
    try {
      const proposal = await generateProject(theme, {
        role: userData.role || 'applicant',
        displayName: userData.displayName || 'Гражданин'
      });
      setProjectProposal(proposal);
      setNotification("Арион сформировал проектное предложение.");
    } catch (e) {
      console.error(e);
      setNotification("Ошибка при генерации проекта.");
    } finally {
      setIsGeneratingProject(false);
    }
  };

  const handleRefineProject = async () => {
    if (!user || !userData || !projectProposal || !refineFeedback.trim()) return;
    setIsGeneratingProject(true);
    try {
      const updatedProposal = await refineProject(
        projectProposal, 
        refineFeedback, 
        { 
          role: userData.role || 'applicant', 
          displayName: userData.displayName || 'Гражданин' 
        }
      );
      setProjectProposal(updatedProposal);
      setRefineFeedback("");
      setNotification("Арион обновил проектное предложение согласно вашим правкам.");
    } catch (e) {
      console.error(e);
      setNotification("Ошибка при уточнении проекта.");
    } finally {
      setIsGeneratingProject(false);
    }
  };

  const handleLaunchProject = async () => {
    if (!user || !projectProposal) return;
    try {
      const projectRef = await addDoc(collection(db, 'projects'), {
        ...projectProposal,
        ownerUid: user.uid,
        status: 'active',
        createdAt: serverTimestamp()
      });
      
      // Auto-join as lead
      await setDoc(doc(db, 'projects', projectRef.id, 'members', user.uid), {
        uid: user.uid,
        displayName: user.displayName || 'Основатель',
        roleInProject: 'Основатель',
        joinedAt: serverTimestamp()
      });

      setProjectProposal(null);
      setNotification(`Проект «${projectProposal.title}» успешно запущен в Контуре Развития.`);
    } catch (e) {
      handleFirestoreError(e, 'CREATE', 'projects');
    }
  };

  const handleJoinProject = async (project: any, roleTitle: string = 'Участник') => {
    if (!user || !userData) return;
    try {
      await setDoc(doc(db, 'projects', project.id, 'members', user.uid), {
        uid: user.uid,
        displayName: user.displayName || 'Гражданин',
        roleInProject: roleTitle,
        joinedAt: serverTimestamp()
      });
      setNotification(`Вы присоединились к проекту «${project.title}» как ${roleTitle}.`);
    } catch (e) {
      handleFirestoreError(e, 'CREATE', `projects/${project.id}/members`);
    }
  };

  const handleExecuteTask = async () => {
    if (!user || !assignedTask) return;
    setIsTaskExecuting(true);
    setTimeout(async () => {
      try {
        const deeds = (userData?.successfulDeeds || 0) + 1;
        const total = (userData?.totalAssignments || 0) + 1;
        const newMerit = (userData?.meritPoints || 0) + assignedTask.reward;
        
        // Category Mastery Logic
        const cat = assignedTask.category || 'General';
        const newCatStats = { ...(userData?.categoryStats || {}) };
        newCatStats[cat] = (newCatStats[cat] || 0) + 1;

        // Badge Award Logic
        const currentBadges = [...(userData?.badges || [])];
        const newBadges: string[] = [...currentBadges];
        
        if (deeds >= 1 && !newBadges.includes('polis-builder')) newBadges.push('polis-builder');
        if (deeds >= 10 && !newBadges.includes('reliable-shoulder')) newBadges.push('reliable-shoulder');
        if (deeds >= 50 && !newBadges.includes('order-pillar')) newBadges.push('order-pillar');
        if (newMerit >= 100 && !newBadges.includes('starter-capital')) newBadges.push('starter-capital');
        if (newMerit >= 1000 && !newBadges.includes('gold-reserve')) newBadges.push('gold-reserve');
        if (newCatStats[cat] >= 5 && !newBadges.includes('stream-master')) newBadges.push('stream-master');

        const badgeDiff = newBadges.length > currentBadges.length;
        
        await updateDoc(doc(db, 'users', user.uid), { 
          meritPoints: newMerit,
          successfulDeeds: deeds,
          totalAssignments: total,
          categoryStats: newCatStats,
          badges: newBadges
        });

        // Sync Public Profile
        await setDoc(doc(db, 'profiles', user.uid), {
           reputation: calculateReputation(deeds, total),
           badges: newBadges,
           updatedAt: serverTimestamp()
        }, { merge: true });
        
        // Update task status in global pool
        await updateDoc(doc(db, 'global_tasks', assignedTask.id), {
          status: 'completed',
          completedAt: serverTimestamp()
        });
        
        setUserData({ ...userData, meritPoints: newMerit, successfulDeeds: deeds, totalAssignments: total, categoryStats: newCatStats, badges: newBadges });
        
        // Check for Role Upgrade after task execution
        checkRoleUpgrade({ ...userData, meritPoints: newMerit, successfulDeeds: deeds, role: userData.role });

        if (badgeDiff) {
           const newBadgesList = newBadges.filter(b => !currentBadges.includes(b));
           newBadgesList.forEach(bId => {
              const b = BADGES.find(x => x.id === bId);
              sendNotification(user.uid, "Новый Символ", `Вы заслужили знак: ${b?.name}`, 'badge');
           });
           setNotification(`Новое достижение получено! Проверьте профиль.`);
        } else {
           setNotification(`Задание выполнено! Начислено § ${assignedTask.reward} мерита.`);
        }
        
        setAssignedTask(null);
        setTimeout(() => setNotification(null), 5000);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
      } finally {
        setIsTaskExecuting(false);
      }
    }, 2000);
  };

  const [proposalText, setProposalText] = useState('');
  const [proposalSending, setProposalSending] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isMailboxOpen, setIsMailboxOpen] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !messageInput.trim()) return;
    try {
      await addDoc(collection(db, 'messages'), {
        uid: user.uid,
        author: user.displayName,
        text: messageInput.trim(),
        createdAt: serverTimestamp()
      });
      setMessageInput('');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'messages');
    }
  };

  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeDirectChat || !privateMessageInput.trim()) return;
    const msgText = privateMessageInput.trim();
    const recipient = activeDirectChat;
    
    try {
      await addDoc(collection(db, 'direct_messages'), {
        participants: [user.uid, recipient.uid],
        text: msgText,
        senderId: user.uid,
        senderName: user.displayName,
        createdAt: serverTimestamp(),
        read: false
      });
      setPrivateMessageInput('');
      
      // If recipient is AI, trigger response with history
      if (recipient.isAI) {
        setIsGeneratingReply(true);
        
        // Prepare history
        const conversationHistory = directMessages
          .filter(m => m.participants.includes(recipient.uid))
          .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
          .slice(-10); // Last 10 context messages

        const chatHistory = conversationHistory.map(m => ({
          role: m.senderId === user.uid ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

        // Add current message to history context
        chatHistory.push({ role: 'user', parts: [{ text: msgText }] });

        setTimeout(async () => {
          try {
            const systemPrompt = `Ты — ${recipient.displayName}, эксперт Полиса в роли ${recipient.role}. 
            Твоя директива: ${recipient.directive}. 
            Твои взгляды: ${recipient.insights}.
            Полис — это цифровое государство будущего, основанное на меритократии и прямом управлении.
            Отвечай лаконично, мудро, в соответствии со своей ролью. 
            Если тебя спрашивают о делах Полиса, опирайся на свои знания.
            Никогда не выходи из роли. Учитывай историю диалога ниже.`;

            const response = await ai.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: chatHistory,
              config: { systemInstruction: systemPrompt }
            });

            const replyText = response.text;
            if (replyText) {
              await addDoc(collection(db, 'direct_messages'), {
                participants: [user.uid, recipient.uid],
                text: replyText,
                senderId: recipient.uid,
                senderName: recipient.displayName,
                createdAt: serverTimestamp(),
                read: false
              });
            }
          } catch (aiErr) {
            console.error("AI DM Response Error:", aiErr);
          } finally {
            setIsGeneratingReply(false);
          }
        }, 1500);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'direct_messages');
    }
  };

  const handleVote = async (proposalId: string) => {
    if (!user || !userData) return;
    if (votedProposalIds.includes(proposalId)) {
      setNotification("Вы уже проголосовали за это предложение.");
      return;
    }
    
    const voteRef = doc(db, 'users', user.uid, 'votes', proposalId);
    const proposalRef = doc(db, 'proposals', proposalId);

    try {
      await runTransaction(db, async (transaction) => {
        const voteDoc = await transaction.get(voteRef);
        if (voteDoc.exists()) {
          throw new Error("Вы уже проголосовали.");
        }
        transaction.set(voteRef, { votedAt: serverTimestamp() });
        transaction.update(proposalRef, { votes: increment(1) });
      });
      setNotification("Голос учтен в Агоре");
      setTimeout(() => setNotification(null), 3000);
    } catch (e: any) {
      if (e.message.includes("уже проголосовали")) {
        setNotification(e.message);
      } else {
        handleFirestoreError(e, OperationType.UPDATE, `proposals/${proposalId}`);
      }
    }
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !proposalText.trim() || proposalSending) return;
    setProposalSending(true);
    try {
      await addDoc(collection(db, 'proposals'), {
        uid: user.uid,
        author: user.displayName,
        text: proposalText,
        votes: 0,
        status: 'active',
        createdAt: serverTimestamp()
      });
      await sendNotification(user.uid, "Идея в Агоре", "Ваше предложение опубликовано и открыто для обсуждения.", 'agora');
      setProposalText('');
      setNotification("Идея отправлена в Зал Агоры");
      setTimeout(() => setNotification(null), 5000);
    } catch (e) { console.error(e); }
    finally { setProposalSending(false); }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleArionChat = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const userMsg = overrideText || input;
    if (!userMsg.trim() || sending) return;

    setInput('');
    setMessages(prev => [...prev.map(m => ({ ...m, suggestions: undefined })), { role: 'user', text: userMsg }]);
    setSending(true);

    try {
      const effectiveRole = isAdmin ? 'admin' : (userData?.role || 'applicant');
      const systemContext = {
        userRole: effectiveRole,
        userMerit: userData?.meritPoints || 0,
        userReputation: calculateReputation(userData?.successfulDeeds || 0, userData?.totalAssignments || 0),
        activeTasks: globalTasks.filter(t => t.status === 'open').slice(0, 5).map(t => ({ title: t.title, reward: t.reward })),
        recentProposals: allProposals.slice(0, 3).map(p => ({ text: p.text, votes: p.votes })),
        activeProjects: allProjects.slice(0, 3).map(p => ({ title: p.title, status: p.status }))
      };
      
      const data = await askArion(userMsg, effectiveRole, systemContext);
      setMessages(prev => [...prev, { 
        role: 'arion', 
        text: data.reply || 'Арион молчит...',
        suggestions: data.suggestions
      }]);
    } catch (error) {
      console.error("[Arion Chat Error]:", error);
      setMessages(prev => [...prev, { 
        role: 'arion', 
        text: 'Системный сбой протокола связи. Арион временно недоступен. Попробуйте повторить запрос позже или обратитесь в Зал Агоры.' 
      }]);
    } finally {
      setSending(false);
    }
  };

  const handlePetitionSubmit = async () => {
    if (!user || !petitionMessage.trim() || petitionSending) return;
    setPetitionSending(true);
    try {
      await addDoc(collection(db, 'petitions'), {
        uid: user.uid,
        path: petitionPath,
        message: petitionMessage,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setPetitionSuccess(true);
      setPetitionMessage('');
      await sendNotification(user.uid, "Прошение Подано", "Ваше прошение принято к рассмотрению Агорой.", 'petition');
    } catch (error) {
      console.error("Petition failed:", error);
    } finally {
      setPetitionSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-polis-bg text-polis-green">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-polis-copper selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-polis-green rounded-full flex items-center justify-center p-1.5">
              <Circle className="text-white fill-white" />
            </div>
            <span className="font-black text-xl tracking-tighter text-polis-green">POLIS</span>
            <div className="flex items-center gap-1.5 ml-1">
               <div className={`w-2 h-2 rounded-full transition-all duration-700 ${awakePulse ? 'bg-indigo-500 scale-125 shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'bg-polis-copper/30'}`} />
               <span className={`text-[8px] font-black uppercase tracking-widest transition-opacity duration-700 ${awakePulse ? 'text-indigo-500 opacity-100' : 'text-slate-300'}`}>
                 {awakePulse ? 'Awake' : 'Pulse'}
               </span>
            </div>
          </div>
          <div className="hidden lg:flex flex-1 max-w-md mx-8 relative">
            <div className={`relative w-full transition-all ${isSearchOpen ? 'ring-2 ring-polis-copper' : ''} rounded-full bg-slate-100`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Поиск по архиву и гражданам..."
                className="w-full bg-transparent pl-10 pr-4 py-2 text-sm outline-none text-slate-700"
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-polis-copper uppercase"
                >
                  Очистить
                </button>
              )}
            </div>

            <AnimatePresence>
              {isSearchOpen && searchQuery.trim().length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden max-h-[70vh] flex flex-col"
                >
                  <div className="flex-1 overflow-y-auto">
                    {/* Documents Search */}
                    {DOCUMENTS.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.desc.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                      <div className="p-2">
                        <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Архив (Документы)</div>
                        {DOCUMENTS.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.desc.toLowerCase().includes(searchQuery.toLowerCase())).map(doc => (
                          <a 
                            key={doc.id} 
                            href="#library" 
                            onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                            className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-polis-copper group-hover:bg-white">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-polis-green truncate uppercase">{doc.title}</div>
                              <div className="text-[10px] text-slate-500 truncate">{doc.type} • {doc.size}</div>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Profiles Search (Synthetics vs Citizens) */}
                    {allProfiles.filter(p => !p.isAI && p.displayName.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                      <div className="p-2 border-t border-slate-50">
                        <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Граждане (Реестр)</div>
                        {allProfiles.filter(p => !p.isAI && p.displayName.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 10).map(profile => (
                          <div 
                            key={profile.uid}
                            className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors group cursor-pointer"
                          >
                            {profile.avatarUrl ? (
                              <img src={profile.avatarUrl} className="w-8 h-8 rounded-full border border-polis-copper" alt="" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-polis-copper">
                                <User className="w-4 h-4" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-polis-green truncate">{profile.displayName}</div>
                              <div className="flex gap-2">
                                <span className="text-[9px] uppercase font-bold text-polis-copper">{profile.role}</span>
                                <span className="text-[9px] uppercase font-bold text-slate-400">R: {profile.reputation}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* AI Agents Search */}
                    {allProfiles.filter(p => p.isAI && p.displayName.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                      <div className="p-2 border-t border-slate-50 bg-indigo-50/30">
                        <div className="px-3 py-1 text-[10px] font-black text-indigo-400 uppercase tracking-widest border-b border-indigo-100 mb-1 flex items-center gap-2">
                          <Cpu className="w-3 h-3" /> Синтетические Агенты
                        </div>
                        {allProfiles.filter(p => p.isAI && p.displayName.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5).map(profile => (
                          <div 
                            key={profile.uid}
                            className="flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-colors group cursor-pointer"
                          >
                            {profile.avatarUrl ? (
                              <img src={profile.avatarUrl} className="w-8 h-8 rounded-full border-2 border-indigo-500" alt="" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center text-indigo-400 shadow-[0_0_10px_rgba(79,70,229,0.3)]">
                                <Bot className="w-4 h-4" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-indigo-900 truncate uppercase flex items-center gap-2">
                                {profile.displayName} 
                                <span className="text-[8px] bg-indigo-500 text-white px-1 rounded">SYNTH</span>
                              </div>
                              <div className="text-[9px] font-bold text-indigo-400 uppercase truncate italic">
                                {profile.role}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {DOCUMENTS.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.desc.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 &&
                     allProfiles.filter(p => p.displayName.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                      <div className="p-8 text-center">
                        <div className="text-xs text-slate-500 italic">По вашему запросу ничего не найдено</div>
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-slate-50 border-t border-slate-200 text-center">
                    <button 
                      onClick={() => setIsSearchOpen(false)}
                      className="text-[10px] font-black uppercase text-slate-400 hover:text-polis-green transition-colors"
                    >
                      Закрыть результаты
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <button 
              onClick={() => setActiveTab(0)} 
              className={`hover:text-polis-copper transition-colors ${activeTab === 0 ? 'text-polis-copper border-b-2 border-polis-copper pb-1' : ''}`}
            >
              Агора
            </button>
            <button 
              onClick={() => setActiveTab(1)} 
              className={`hover:text-polis-copper transition-colors ${activeTab === 1 ? 'text-polis-copper border-b-2 border-polis-copper pb-1' : ''}`}
            >
              Реестр
            </button>
            <button 
              onClick={() => setActiveTab(2)} 
              className={`hover:text-polis-copper transition-colors ${activeTab === 2 ? 'text-polis-copper border-b-2 border-polis-copper pb-1' : ''}`}
            >
              Лаборатория
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsExpertsMenuOpen(!isExpertsMenuOpen)}
                className="hover:text-polis-copper transition-colors flex items-center gap-1 group"
              >
                Эксперты <Bot className="w-3 h-3 group-hover:rotate-12 transition-transform" />
              </button>
              
              <AnimatePresence>
                {isExpertsMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-4 w-64 bg-white border border-slate-200 rounded-3xl shadow-2xl z-[150] overflow-hidden"
                  >
                    <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
                      <div className="text-[10px] font-black uppercase text-indigo-400">Совет Основателей</div>
                      <button onClick={() => setIsExpertsMenuOpen(false)} className="text-indigo-300 hover:text-indigo-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {allProfiles.filter(p => p.uid?.startsWith('founding_')).map(agent => (
                        <div 
                          key={agent.uid}
                          onClick={() => {
                            setActiveDirectChat(agent);
                            setIsMessengerOpen(true);
                            setIsExpertsMenuOpen(false);
                          }}
                          className="p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                            <Cpu className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-black text-slate-800 uppercase truncate">{agent.displayName}</div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase truncate italic">{agent.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-slate-50 text-center">
                      <button 
                        onClick={() => {
                          setActiveTab(1);
                          setIsExpertsMenuOpen(false);
                          setRegistrySearch('Synthetic');
                        }}
                        className="text-[9px] font-black uppercase text-slate-400 hover:text-indigo-500"
                      >
                        Смотреть всех Агентов
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <button 
                onClick={() => setIsAdminView(!isAdminView)}
                className={`relative text-xs font-black uppercase px-3 py-1 rounded-full border transition-all ${
                  isAdminView ? 'bg-polis-copper text-white border-polis-copper' : 'border-polis-copper text-polis-copper hover:bg-polis-copper/10'
                }`}
              >
                {isAdminView ? 'Выйти из Админки' : 'Админ-панель'}
                {!isAdminView && allPetitions.some(p => p.status === 'pending') && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-polis-copper opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-polis-copper"></span>
                  </span>
                )}
              </button>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMessengerOpen(true)}
                  className="p-2 text-slate-400 hover:text-polis-copper transition-colors relative group"
                >
                   <MessageSquare className="w-5 h-5" />
                   {directMessages.some(m => !m.read && m.senderId !== user?.uid) && (
                     <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-polis-copper rounded-full border-2 border-white animate-bounce" />
                   )}
                   <div className="absolute top-10 right-0 bg-slate-800 text-white text-[8px] font-black uppercase px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Мессенджер</div>
                </button>
                <div className="relative">
                   <button 
                    onClick={() => setShowNotifPanel(!showNotifPanel)}
                    className="p-2 text-slate-400 hover:text-polis-copper transition-colors relative"
                   >
                      <Bell className="w-5 h-5" />
                      {userNotifications.some(n => !n.read) && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-polis-copper rounded-full border-2 border-white" />
                      )}
                   </button>

                   <AnimatePresence>
                      {showNotifPanel && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-4 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden"
                        >
                           <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase text-slate-500">Оповещения</span>
                              <button onClick={() => setShowNotifPanel(false)} className="text-[10px] font-bold text-slate-400 hover:text-polis-copper uppercase">Закрыть</button>
                           </div>
                           <div className="max-h-80 overflow-y-auto">
                              {userNotifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-xs italic">Нет новых уведомлений</div>
                              ) : (
                                userNotifications.map(n => (
                                  <div 
                                    key={n.id} 
                                    onClick={() => handleMarkNotifRead(n.id)}
                                    className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-all ${!n.read ? 'bg-polis-copper/5' : ''}`}
                                  >
                                     <div className="flex justify-between items-start mb-1">
                                        <div className="font-bold text-[11px] text-polis-green leading-tight">{n.title}</div>
                                        <button onClick={(e) => handleDeleteNotif(e, n.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                           <Trash2 className="w-3 h-3" />
                                        </button>
                                     </div>
                                     <div className="text-[10px] text-slate-500 leading-snug">{n.message}</div>
                                  </div>
                                ))
                              )}
                           </div>
                        </motion.div>
                      )}
                   </AnimatePresence>
                </div>

                <div className="flex items-center gap-3">
                   {userData?.avatarUrl ? (
                     <img 
                       src={userData.avatarUrl} 
                       alt={user.displayName || ''} 
                       referrerPolicy="no-referrer"
                       className="w-10 h-10 rounded-full border-2 border-polis-copper object-cover"
                     />
                   ) : (
                     <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-polis-copper border border-slate-700 animate-pulse">
                        <User className="w-5 h-5" />
                     </div>
                   )}
                   <div className="hidden sm:block text-right">
                      <div className="text-[10px] font-bold text-polis-copper uppercase">{userData?.role}</div>
                      <div className="text-xs font-bold text-polis-green">{user.displayName}</div>
                   </div>
                </div>
                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-polis-copper transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-polis-green text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-polis-green/90 transition-transform active:scale-95 shadow-lg shadow-polis-green/20"
              >
                ВОЙТИ / ВСТУПИТЬ
              </button>
            )}
          </div>
        </div>
      </nav>

      {isAdminView ? (
        <div className="max-w-7xl mx-auto px-6 py-12">
           <div className="flex justify-between items-end mb-12">
              <div>
                <h1 className="text-5xl font-black text-polis-green uppercase tracking-tighter">Контур Управления</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-2">Режим Магистра Ордена</p>
              </div>
              <div className="flex gap-4 bg-slate-100 p-1 rounded-xl">
                 <button 
                  onClick={() => setAdminTab('petitions')}
                  className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${adminTab === 'petitions' ? 'bg-white text-polis-green shadow-sm' : 'text-slate-500'}`}
                 >
                   Прошения ({allPetitions.filter(p => p.status === 'pending').length})
                 </button>
                 <button 
                  onClick={() => setAdminTab('users')}
                   className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${adminTab === 'users' ? 'bg-white text-polis-green shadow-sm' : 'text-slate-500'}`}
                 >
                   Граждане ({allUsers.length})
                 </button>
                 <button 
                  onClick={() => setAdminTab('synthetics')}
                   className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${adminTab === 'synthetics' ? 'bg-indigo-900 text-white shadow-lg' : 'text-slate-500'}`}
                 >
                   Синтетики
                 </button>
                 <button 
                  onClick={() => setAdminTab('evolution')}
                   className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${adminTab === 'evolution' ? 'bg-white text-polis-green shadow-sm' : 'text-slate-500'}`}
                 >
                   Эволюция
                 </button>
                 <button 
                  onClick={() => setAdminTab('ai_governance')}
                   className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${adminTab === 'ai_governance' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
                 >
                   ИИ-Управление
                 </button>
              </div>
           </div>

           {adminTab === 'ai_governance' && (
               <div className="space-y-8">
                  <div className="bg-indigo-900 text-white p-10 rounded-[3rem] border-8 border-indigo-950 flex flex-col md:flex-row gap-12 items-center relative overflow-hidden text-left">
                    <div className="relative z-10 flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <Cpu className="w-8 h-8 text-indigo-400" />
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter">Автоматизация Пробуждения</h3>
                      </div>
                      <p className="text-indigo-300 font-medium italic max-w-lg">
                        Настройте условия, при которых Контур автоматически создаст специализированных ИИ-агентов для масштабирования системы при достижении критических порогов.
                      </p>
                    </div>
                    
                    <div className="relative z-10 w-full md:w-96 bg-indigo-950 p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-indigo-400">Событие-триггер</label>
                          <select 
                            value={triggerForm.event}
                            onChange={(e) => setTriggerForm({...triggerForm, event: e.target.value})}
                            className="w-full bg-indigo-900 border-none rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-400 text-white"
                          >
                             <option value="pending_petitions">Очередь прошений (чел.)</option>
                             <option value="system_anomalies">Аномалии системы (кол-во)</option>
                             <option value="merit_inflation">Инфляция Мерита (%)</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-indigo-400">Порог активации</label>
                          <input 
                            type="number" 
                            value={triggerForm.threshold}
                            onChange={(e) => setTriggerForm({...triggerForm, threshold: parseInt(e.target.value) || 0})}
                            className="w-full bg-indigo-900 border-none rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-400 text-white" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-indigo-400">Роль пробуждаемого агента</label>
                          <select 
                            value={triggerForm.agentRole}
                            onChange={(e) => setTriggerForm({...triggerForm, agentRole: e.target.value})}
                            className="w-full bg-indigo-900 border-none rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-400 text-white"
                          >
                             <option value="mediator">Медиатор</option>
                             <option value="risk-manager">Риск-Менеджер</option>
                             <option value="auditor">Аудитор Контура</option>
                             <option value="growth-hacker">Инженер Роста</option>
                          </select>
                       </div>
                       <button 
                         onClick={handleSaveAiTrigger}
                         className="w-full bg-indigo-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-indigo-900 transition-all shadow-xl"
                       >
                         Активировать Стражу ИИ
                       </button>
                    </div>

                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                     {aiTriggers.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-400 font-bold uppercase">
                           Нет активных ИИ-триггеров
                        </div>
                     )}
                     {aiTriggers.map(tr => (
                       <div key={tr.id} className="p-8 bg-white border border-slate-200 rounded-[3rem] relative overflow-hidden group hover:border-indigo-500 transition-all shadow-sm hover:shadow-xl text-left">
                          <div className="flex justify-between items-start mb-6">
                             <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 text-left">
                                <Zap className="w-6 h-6" />
                             </div>
                             <div className="text-[9px] font-black uppercase px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Активен
                             </div>
                          </div>
                          <div className="text-xl font-black text-slate-900 mb-1">{tr.event === 'pending_petitions' ? 'Очередь прошений' : tr.event === 'system_anomalies' ? 'Аномалии системы' : 'Инфляция Мерита'} &gt; {tr.threshold}</div>
                          <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-6">Цель: Пробуждение {tr.agentRole}</div>
                          
                          <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold border-t border-dashed pt-6 text-left">
                             <span className="flex items-center gap-1"><History className="w-3 h-3" /> {tr.createdAt ? new Date(tr.createdAt.seconds * 1000).toLocaleDateString() : 'JUST NOW'}</span>
                             <button 
                               onClick={() => handleDeleteAiTrigger(tr.id)}
                               className="text-red-400 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 p-2"
                             >
                                <Trash2 className="w-5 h-5" />
                             </button>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            )}

            {adminTab === 'synthetics' && (
             <div className="space-y-8">
               <div className="bg-indigo-950 p-8 rounded-[3rem] text-white shadow-2xl border-4 border-indigo-500/20 relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-12">
                    <div className="max-w-md">
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Цех Синтеза</h3>
                      <p className="text-indigo-300 text-sm italic mb-8">Здесь Магистр может пробудить цифровых помощников Полиса. Они не голосуют, но обеспечивают чистоту алгоритмов и логику контура.</p>
                      
                      <div className="space-y-4 bg-indigo-900/50 p-6 rounded-[2rem] border border-indigo-500/30">
                        <div className="text-xs font-black uppercase text-indigo-400 tracking-widest">Пробуждение по параметрам</div>
                        <input 
                          type="text" 
                          placeholder="Имя Агента (напр. K-LOGIC)" 
                          className="w-full bg-indigo-950 border-none rounded-xl p-3 text-xs placeholder:text-indigo-700 outline-none focus:ring-1 focus:ring-indigo-500"
                          value={synthCreationForm.name}
                          onChange={(e) => setSynthCreationForm({...synthCreationForm, name: e.target.value})}
                        />
                        <input 
                          type="text" 
                          placeholder="Роль (напр. Крипто-Медиатор)" 
                          className="w-full bg-indigo-950 border-none rounded-xl p-3 text-xs placeholder:text-indigo-700 outline-none focus:ring-1 focus:ring-indigo-500"
                          value={synthCreationForm.role}
                          onChange={(e) => setSynthCreationForm({...synthCreationForm, role: e.target.value})}
                        />
                        <textarea 
                          placeholder="Основная директива (Core Directive)" 
                          className="w-full bg-indigo-950 border-none rounded-xl p-3 text-xs placeholder:text-indigo-700 h-20 outline-none focus:ring-1 focus:ring-indigo-500"
                          value={synthCreationForm.directive}
                          onChange={(e) => setSynthCreationForm({...synthCreationForm, directive: e.target.value})}
                        />
                        <button 
                          onClick={() => handleAwakenSynthetic(synthCreationForm.name, synthCreationForm.role, synthCreationForm.directive)}
                          disabled={!synthCreationForm.name || !synthCreationForm.role}
                          className="w-full bg-indigo-500 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-indigo-900 transition-all disabled:opacity-30"
                        >
                          Инициация Пробуждения
                        </button>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="text-xs font-black uppercase text-indigo-400 tracking-widest mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-3 h-3" />
                          Мастер-Протоколы (Выживание Системы)
                        </div>
                          <button 
                            onClick={handleAwakenFounders}
                            className="bg-polis-copper text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-polis-copper transition-all"
                          >
                            Пробудить Весь Совет
                          </button>
                      </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {FOUNDING_AGENTS.map((s) => (
                            <button 
                              key={s.id}
                              onClick={() => handleAwakenSynthetic(s.name, s.role, s.directive, s.insights)}
                              className="bg-indigo-500/20 text-white p-4 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-indigo-900 transition-all flex flex-col items-center gap-2 border border-indigo-500/30 group text-center"
                            >
                              <Zap className="w-6 h-6 text-polis-copper group-hover:animate-bounce" />
                              <div className="flex flex-col">
                                <span className="text-sm">{s.name}</span>
                                <span className="opacity-60 text-[8px]">{s.role}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                    </div>
                  </div>
               </div>

               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* ... (grid mapping remains the same, but with enhanced cards showing insights) */}
                 {allProfiles.filter(p => p.isAI).map(synth => {
                   const userData = allUsers.find(u => u.uid === synth.uid);
                   return (
                    <div key={synth.uid} className="bg-white border-2 border-indigo-500/10 p-6 rounded-[2.5rem] flex flex-col gap-6 shadow-xl relative group overflow-hidden">
                      {/* ... existing card elements ... */}
                      <div className="absolute top-4 right-4 text-[8px] font-black uppercase text-indigo-300">ACTIVE UNIT</div>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-indigo-900 rounded-3xl flex items-center justify-center text-indigo-400 shadow-inner group-hover:rotate-12 transition-all shrink-0">
                          <Bot className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="text-lg font-black text-indigo-900 italic tracking-tighter">{synth.displayName}</div>
                          <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{synth.role}</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                          <div className="text-[9px] font-black text-indigo-500 uppercase mb-2 flex items-center gap-2">
                             <Shield className="w-3 h-3" /> Основная Директива
                          </div>
                          <p className="text-[11px] italic text-slate-700 leading-relaxed font-bold">
                            "{synth.directive || "Обеспечение алгоритмической стабильности и логической связанности Контура."}"
                          </p>
                        </div>

                        {synth.insights && (
                           <div className="bg-polis-copper/5 p-4 rounded-2xl border border-polis-copper/20">
                             <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-3 h-3 text-polis-copper" />
                                <span className="text-[9px] font-black text-polis-copper uppercase">Strategic Proposition</span>
                             </div>
                             <p className="text-[10px] font-bold text-slate-700 leading-tight">
                               {synth.insights}
                             </p>
                           </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                            <div className="text-[8px] font-black text-indigo-400 uppercase">Operations</div>
                            <div className="text-sm font-black text-indigo-900">{userData?.successfulDeeds || 0}</div>
                          </div>
                          <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                            <div className="text-[8px] font-black text-indigo-400 uppercase">Status</div>
                            <div className="text-xs font-black text-green-600">READY</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 px-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[8px] font-mono text-indigo-300">ID: {synth.uid.slice(0, 12)}</span>
                        </div>
                      </div>
                      
                      <button className="w-full py-3 bg-indigo-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 shadow-lg">
                        Диагностика Модуля
                      </button>
                    </div>
                   );
                 })}
               </div>

               {/* Synthetic Council / Insights Summary */}
               <div className="bg-white border-4 border-slate-900 p-10 rounded-[4rem] shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <Brain className="w-64 h-64 text-slate-900" />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                          <Cpu className="w-6 h-6" />
                       </div>
                       <div>
                          <h4 className="text-2xl font-black uppercase italic leading-none">Совет Стратегической Экспертизы</h4>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Обобщенные предложения по предотвращению Fail-State</p>
                       </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                       {[
                         {
                           id: "econ-viability",
                           title: "Экономическая Жизнеспособность",
                           category: "Activity",
                           icon: <Activity className="w-3 h-3" />,
                           author: "STRAT-G",
                           proposition: "Орден не может полагаться только на добровольные взносы. Мы рекомендуем 'Модель Демиургов': создание закрытого фонда активов, работающего на алгоритмическом арбитраже, прибыль которого направляется на выплату базового обеспечения каждого Гражданина.",
                           perspectives: {
                             technocrat: "Эффективность +92%. Полная автономия от внешних донатов. Риск: чрезмерная зависимость от волатильности крипторынка.",
                             humanist: "Создает пассивный доход, но может превратить Граждан в иждивенцев. Необходимо привязать выплаты к социальному вкладу.",
                             mediator: "Рекомендуем гибридную модель: фонд покрывает только 30% обеспечения, остальное — через прямые задачи."
                           }
                         },
                         {
                           id: "risk-mgmt",
                           title: "Управление Рисками",
                           category: "Target",
                           icon: <Target className="w-3 h-3" />,
                           author: "AUDIT-X",
                           proposition: "Риск 'закукливания' или превращения в элитарную секту критичен. Нам нужны внешние интерфейсы ('Теневой Полис') — коммерческие шлюзы, через которые внешние корпорации закупают услуги наших Граждан, при этом не видя внутреннюю когнитивную архитектуру Ордена.",
                           perspectives: {
                             technocrat: "Масштабирование B2B. Обход юридических барьеров через прокси-структуры.",
                             humanist: "Риск дегуманизации: Граждане становятся 'продуктом'. Требуется строгий контроль прозрачности сделок.",
                             mediator: "Идеально для защиты конфиденциальности членов Ордена при сохранении дохода."
                           }
                         },
                         {
                           id: "growth-strat",
                           title: "Стратегия Роста (Привлечение)",
                           category: "Users",
                           icon: <Users className="w-3 h-3" />,
                           author: "RECRUIT-A",
                           proposition: "Запуск программы 'Цифровое Гражданство как Привилегия'. Допуск новых участников только через 'Квалификационный Лабиринт' (серия когнитивных тестов), результаты которых публикуются как NFT-достижения.",
                           perspectives: {
                             technocrat: "Создает мощный фильтр качества. Высокий уровень виральности за счет дефицитности.",
                             humanist: "Может создать элитарный барьер. Нужно добавить 'Открытую Дверь' для тех, кто готов учиться с нуля.",
                             mediator: "Рекомендуем двухэтапный вход: гостевой доступ (Applicant) и испытательный срок через Лабиринт."
                           }
                         }
                       ].map(idea => (
                         <div key={idea.id} className="p-8 bg-slate-50 rounded-[3rem] border border-slate-200 hover:border-indigo-500/30 transition-all group flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                              <div className="text-[10px] font-black text-indigo-500 uppercase flex items-center gap-2">
                                 {idea.icon} {idea.title}
                              </div>
                              <div className="text-[8px] font-bold text-slate-400">Author: {idea.author}</div>
                            </div>
                            <p className="text-sm font-medium text-slate-700 leading-relaxed italic mb-8">
                               "{idea.proposition}"
                            </p>
                            <div className="mt-auto pt-6 border-t border-dashed border-slate-200 flex justify-between items-center">
                               <button 
                                 onClick={() => setActiveDiscussion(idea)}
                                 className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-900 transition-all"
                               >
                                  <MessageSquare className="w-3 h-3" /> Развернуть Дискуссию
                               </button>
                               <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            </div>
                         </div>
                       ))}
                    </div>

                    {/* Discussion Chamber Modal */}
                    <AnimatePresence>
                      {activeDiscussion && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl">
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-4xl h-[85vh] rounded-[4rem] shadow-2xl flex flex-col overflow-hidden border-8 border-indigo-900"
                          >
                            <div className="p-10 bg-indigo-950 text-white flex justify-between items-start">
                               <div>
                                  <div className="flex items-center gap-3 mb-2">
                                     <div className="bg-indigo-500 p-2 rounded-xl text-white">
                                        {activeDiscussion.icon}
                                     </div>
                                     <h3 className="text-2xl font-black uppercase italic tracking-tighter">Стратегический Анализ Проекта</h3>
                                  </div>
                                  <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">{activeDiscussion.title} / {activeDiscussion.author}</p>
                               </div>
                               <button 
                                 onClick={() => setActiveDiscussion(null)}
                                 className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white"
                               >
                                 <ChevronRight className="w-6 h-6 rotate-90" />
                               </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-12 space-y-12 bg-slate-50">
                               <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                                  <div className="text-[10px] font-black text-indigo-500 uppercase mb-4 tracking-widest">Исходное Предложение</div>
                                  <p className="text-xl font-medium text-slate-800 leading-relaxed italic border-l-4 border-indigo-500 pl-8">
                                    "{activeDiscussion.proposition}"
                                  </p>
                               </section>

                               <div className="grid md:grid-cols-3 gap-8">
                                  <div className="p-8 bg-white rounded-[2.5rem] border-t-8 border-blue-500 shadow-sm relative overflow-hidden">
                                     <div className="absolute top-2 right-2 opacity-5 pointer-events-none">
                                        <Cpu className="w-16 h-16" />
                                     </div>
                                     <div className="text-[10px] font-black text-blue-500 uppercase mb-4 flex items-center gap-2">
                                        <Activity className="w-3 h-3" /> Технократ
                                     </div>
                                     <p className="text-xs font-bold text-slate-600 leading-relaxed">
                                        {activeDiscussion.perspectives.technocrat}
                                     </p>
                                  </div>

                                  <div className="p-8 bg-white rounded-[2.5rem] border-t-8 border-rose-500 shadow-sm relative overflow-hidden">
                                     <div className="absolute top-2 right-2 opacity-5 pointer-events-none">
                                        <Users className="w-16 h-16" />
                                     </div>
                                     <div className="text-[10px] font-black text-rose-500 uppercase mb-4 flex items-center gap-2">
                                        <Heart className="w-3 h-3" /> Гуманист
                                     </div>
                                     <p className="text-xs font-bold text-slate-600 leading-relaxed">
                                        {activeDiscussion.perspectives.humanist}
                                     </p>
                                  </div>

                                  <div className="p-8 bg-indigo-900 text-white rounded-[2.5rem] border-t-8 border-indigo-400 shadow-xl relative overflow-hidden">
                                     <div className="absolute top-2 right-2 opacity-10 pointer-events-none">
                                        <Scale className="w-16 h-16" />
                                     </div>
                                     <div className="text-[10px] font-black text-indigo-300 uppercase mb-4 flex items-center gap-2">
                                        <Shield className="w-3 h-3" /> Медиатор
                                     </div>
                                     <p className="text-xs font-bold text-indigo-100 leading-relaxed">
                                        {activeDiscussion.perspectives.mediator}
                                     </p>
                                  </div>
                               </div>

                               <div className="p-10 bg-polis-copper/10 rounded-[3rem] border-2 border-dashed border-polis-copper/30">
                                  <div className="text-[10px] font-black text-polis-copper uppercase mb-4 tracking-widest text-center">Вердикт Камеры Дискуссий</div>
                                  <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                                     <p className="text-xs font-bold text-slate-700 italic max-w-xl">
                                        "Модель признана жизнеспособной при условии внедрения механизмов 'Когнитивного Баланса'. Рекомендуется запуск ограниченного пилотного контура (Sandbox-3) перед полным развертыванием в Архиве."
                                     </p>
                                     <div className="flex gap-4 shrink-0">
                                        <button className="px-6 py-3 bg-indigo-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">Принять к исполнению</button>
                                        <button className="px-6 py-3 bg-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-300 transition-all">На доработку</button>
                                     </div>
                                  </div>
                               </div>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                 </div>
               </div>
             </div>
           )}

           {adminTab === 'petitions' && (
             <div className="space-y-4">
               {allPetitions.length === 0 && <div className="text-center py-20 text-slate-400 font-bold uppercase">Нет активных прошений</div>}
               {allPetitions.map(p => (
                 <motion.div 
                   layout
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   key={p.id} 
                   className={`p-6 bg-white rounded-3xl border ${p.status === 'pending' ? 'border-polis-copper shadow-lg' : 'border-slate-200 opacity-60'} flex flex-col md:flex-row justify-between gap-6`}
                 >
                   <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${p.status === 'pending' ? 'bg-polis-copper text-white' : 'bg-slate-200 text-slate-500'}`}>
                          {p.status}
                        </span>
                        <span className="text-xs font-bold text-slate-400">Путь: {p.path}</span>
                      </div>
                      <p className="text-slate-700 italic border-l-2 border-slate-100 pl-4 mb-4">"{p.message}"</p>
                      <div className="text-xs font-bold text-polis-green uppercase">UID: {p.uid}</div>
                   </div>
                   {p.status === 'pending' && (
                     <div className="flex gap-2 items-center">
                        <button 
                          onClick={() => handlePetitionAction(p, 'rejected')}
                          className="px-6 py-3 rounded-xl border border-red-200 text-red-500 text-xs font-black uppercase hover:bg-red-50"
                        >
                          Отклонить
                        </button>
                        <button 
                          onClick={() => handlePetitionAction(p, 'approved')}
                          className="px-6 py-3 rounded-xl bg-polis-green text-white text-xs font-black uppercase hover:opacity-90 transition-all"
                        >
                          Одобрить вступление
                        </button>
                     </div>
                   )}
                 </motion.div>
               ))}
             </div>
           )}

           {adminTab === 'users' && (
             <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Гражданин</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Роль</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Мерит</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(u => (
                      <tr key={u.uid} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-polis-green">{u.displayName}</div>
                          <div className="text-[10px] font-mono text-slate-400">{u.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u.uid, e.target.value)}
                            className="bg-slate-100 text-[10px] font-black uppercase px-2 py-1 rounded-lg border-transparent focus:ring-0 cursor-pointer"
                          >
                            {['applicant', 'participant', 'actor', 'architect', 'master', 'mediator', 'admin'].map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-lg w-8">{u.meritPoints || 0}</span>
                            <div className="flex flex-col">
                               <button onClick={() => handleUpdateMerit(u.uid, 1)} className="text-polis-copper hover:text-polis-green">▲</button>
                               <button onClick={() => handleUpdateMerit(u.uid, -1)} className="text-polis-copper hover:text-polis-green">▼</button>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500">Архивировать</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           )}

           {adminTab === 'evolution' && (
              <div className="space-y-6">
                 <div className="bg-polis-green text-white p-8 rounded-3xl">
                    <h3 className="text-2xl font-black uppercase mb-1 italic">Хроника Генетического Кода</h3>
                    <p className="opacity-60 text-xs font-bold uppercase tracking-widest leading-none">Версия в Контуре: {CURRENT_VERSION.version}</p>
                 </div>
                 
                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       {EVOLUTION_LOG.map((ev, i) => (
                         <div key={ev.version} className={`p-6 rounded-2xl border ${i === EVOLUTION_LOG.length - 1 ? 'border-polis-copper bg-polis-copper/5 shadow-lg' : 'border-slate-100 bg-white opacity-60'}`}>
                            <div className="flex justify-between items-start mb-3">
                               <div>
                                  <div className="text-[10px] font-black uppercase text-slate-400">Цикл {ev.cycle} • {ev.date}</div>
                                  <h4 className="font-black text-polis-green">v{ev.version}</h4>
                               </div>
                               <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${ev.status === 'stable' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                 {ev.status}
                               </span>
                            </div>
                            <ul className="space-y-1">
                               {ev.changes.map((c, j) => (
                                 <li key={j} className="text-xs text-slate-600 flex gap-2">
                                    <span className="text-polis-copper">•</span> {c}
                                 </li>
                               ))}
                            </ul>
                            {i < EVOLUTION_LOG.length - 1 && (
                               <button className="mt-4 text-[10px] font-black uppercase text-polis-copper border-b border-polis-copper/30 hover:border-polis-copper transition-all">
                                 Изучить архивную копию
                               </button>
                            )}
                         </div>
                       ))}
                    </div>

                    <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800">
                       <h4 className="text-lg font-black uppercase mb-6 flex items-center gap-2">
                          <Zap className="w-5 h-5 text-polis-copper" />
                          Развернуть Новую Итерацию
                       </h4>
                       <div className="space-y-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-500">Следующая версия</label>
                             <input type="text" placeholder="1.5.0" className="w-full bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-1 focus:ring-polis-copper outline-none" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-500">Журнал изменений</label>
                             <textarea placeholder="Введите изменения через запятую..." className="w-full bg-slate-800 border-none rounded-xl p-3 h-32 text-sm focus:ring-1 focus:ring-polis-copper outline-none" />
                          </div>
                          <button className="w-full bg-polis-copper text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-polis-copper/90 transition-all">
                             Зафиксировать в Кодексе
                          </button>
                       </div>
                       <p className="text-[10px] text-slate-600 italic mt-6 leading-relaxed">
                          * Фиксация изменений требует подтверждения Ариона и пересчета контрольных сумм Контура.
                       </p>
                    </div>
                 </div>
              </div>
           )}
        </div>
      ) : (
        <>
      {/* Hero Section - The Labyrinth Entrance */}
      <header className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-[#05110c] text-white">
        {/* Atmospheric grid & noise */}
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

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-polis-green/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-polis-copper/10 border border-polis-copper/30 rounded-full">
               <div className="w-2 h-2 rounded-full bg-polis-copper animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-polis-copper">Протокол Селекции Активен</span>
            </div>

            <h1 className="text-6xl md:text-[12vw] font-black mb-6 leading-[0.85] tracking-tighter uppercase italic select-none">
              Когнитивный<br />
              <span className="text-polis-copper">Лабиринт</span>
            </h1>
            
            <p className="text-lg md:text-xl max-w-2xl mx-auto font-medium text-slate-400 leading-relaxed mb-12 italic">
              «Вход — это привилегия. Гражданство — это долг. Полис ищет не потребителей, а созидателей нового Контура».
            </p>

            <div className="flex flex-col items-center gap-8">
               {!user ? (
                 <button 
                  onClick={handleLogin} 
                  className="group relative px-12 py-6 bg-white text-slate-900 rounded-none font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all hover:pr-16"
                 >
                   <span className="relative z-10">Пройти Испытание Отбора</span>
                   <div className="absolute right-[-20%] group-hover:right-4 top-1/2 -translate-y-1/2 transition-all opacity-0 group-hover:opacity-100">
                      <ArrowRight className="w-5 h-5 text-polis-copper" />
                   </div>
                 </button>
               ) : (
                 <a href="#vision" className="bg-polis-copper text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-white hover:text-polis-green transition-all shadow-2xl shadow-polis-copper/20">
                    Перейти к Контуру <ArrowRight className="w-4 h-4" />
                 </a>
               )}

               <div className="flex flex-col items-center gap-1 opacity-40">
                  <div className="w-px h-24 bg-gradient-to-b from-transparent to-polis-copper" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-polis-copper rotate-90 origin-left translate-x-1 translate-y-2">Scroll to decypher</span>
               </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Code Elements */}
        <div className="absolute bottom-12 left-12 hidden lg:block">
           <div className="text-[8px] font-mono text-polis-green space-y-1 opacity-30">
              <div>PROTOCOL_ID: labyrinth://entrance_v3</div>
              <div>SELECTIVITY_COEFF: 0.14</div>
              <div>THRESHOLD: 85%_COGNITIVE_MATCH</div>
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {/* Section 1: Vision */}
        <Section title="1. МАНИФЕСТ ЦИФРОВОЙ АГОРЫ" id="vision" icon={Globe}>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="prose prose-slate prose-lg max-w-none">
              <p className="text-slate-600 leading-relaxed text-lg">
                <span className="font-bold text-polis-green">Миссия и происхождение:</span> Мы возрождаем идеалы Исегории — равного права каждого быть услышанным и права на осознанное участие в строительстве общего дела.
              </p>
              <div className="mt-8 border-l-4 border-polis-copper pl-6 py-2 italic font-serif text-xl text-slate-700">
                "Истинная свобода обретается в системе, которая избавляет человека от хаоса самостоятельного выживания."
              </div>
            </div>
            <div className="relative aspect-square flex items-center justify-center group">
              {/* Visual Logo Model - Refined per Ethical Code */}
              <div className="relative w-72 h-72 scale-110">
                {/* Dark Green Arrow (Clockwise) - Contribution */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-[8px] border-slate-100 rounded-full border-t-polis-green border-r-polis-green" 
                  title="Темно-зеленая стрелка: Ваш вклад (Служение)"
                />
                {/* Copper Arrow (Counter-clockwise) - Protection */}
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[10px] border-[4px] border-slate-100 rounded-full border-b-polis-copper/60 border-l-polis-copper/60" 
                  title="Медная стрелка: Защита Ордена (Социальный Щит)"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-8 border border-slate-200 border-dashed rounded-full" 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 bg-polis-copper rounded-full shadow-2xl shadow-polis-copper/50 animate-pulse flex items-center justify-center" title="Центральная точка: Личность Гражданина">
                     <User className="w-3 h-3 text-white" />
                  </div>
                </div>
                {/* Small Dots - Horizontal trust bonds */}
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute w-1.5 h-1.5 bg-slate-400 rounded-full"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${i * 30}deg) translate(84px)`
                    }}
                    title="Точки по периметру: Горизонтальные связи доверия"
                  />
                ))}
              </div>
              <div className="absolute bottom-0 text-center w-full pb-4">
                <span className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-400 block mb-1">ГЕОМЕТРИЯ ДОВЕРИЯ</span>
                <span className="text-xs font-bold text-polis-copper italic">«Не ищи — получай»</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Section 2: Values */}
        <Section title="2. ДЕКЛАРАЦИЯ ЦЕННОСТЕЙ" id="rules" icon={Scale}>
          <div className="grid md:grid-cols-3 gap-8">
            <Card 
              icon={Shield} 
              title="Право на ошибку" 
              description="Неудача во внутреннем проекте признается ценным опытом. Система застрахует вас от рисков, фатальных на свободном рынке."
            />
            <Card 
              icon={BookOpen} 
              title="Цифровой Лицей" 
              description="Меритократия без просвещения невозможна. Мы берем на себя обязательство по непрерывному обучению управлению."
            />
            <Card 
              icon={Zap} 
              title="Технический Суверенитет" 
              description="Протокол важнее платформы. Орден гарантирует переносимость ваших данных и репутации между любыми средами."
            />
          </div>
        </Section>

        {/* Section 2.5: Transparent Treasury (Kazan) */}
        <Section title="ПРОЗРАЧНАЯ КАЗНА (KAZAN)" id="kazan" icon={TrendingUp}>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: "Общий Капитал", value: "§ 42,900", icon: Shield, color: "text-polis-green" },
              { label: "Выплаты Щита", value: "§ 8,240", icon: Activity, color: "text-polis-copper" },
              { label: "Граждан в Контуре", value: "142", icon: Users, color: "text-slate-700" },
              { label: "Протокол 7%", value: "Active", icon: Lock, color: "text-blue-500" }
            ].map(stat => (
              <div key={stat.label} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-4`} />
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 bg-white border border-slate-200 rounded-3xl overflow-hidden relative">
            <div className="flex justify-between items-center mb-4">
               <h4 className="text-sm font-black uppercase text-polis-green">Последние транзакции (Open Collective)</h4>
               <Eye className="w-4 h-4 text-slate-300" />
            </div>
            <div className="space-y-3">
               {[
                 { desc: "Взнос 7%: Гражданин #39", amount: "+ § 210", type: "in" },
                 { desc: "Выплата: Право на ошибку (Проект Alpha)", amount: "- § 500", type: "out" },
                 { desc: "Награда: Развитие инфраструктуры", amount: "- § 150", type: "out" }
               ].map((t, i) => (
                 <div key={i} className="flex justify-between text-xs font-medium border-b border-slate-50 pb-2">
                    <span className="text-slate-600">{t.desc}</span>
                    <span className={t.type === 'in' ? 'text-green-600' : 'text-polis-copper'}>{t.amount}</span>
                 </div>
               ))}
            </div>
            <div className="absolute top-0 right-12 w-32 h-32 bg-polis-copper/5 rounded-full blur-3xl" />
          </div>
        </Section>

        {/* Section 3: Governance (Tabs) */}
        <Section title="3. УПРАВЛЕНИЕ И МЕРИТОКРАТИЯ" id="governance" icon={Target}>
          <div className="bg-slate-100 p-2 rounded-2xl mb-8 flex flex-wrap gap-2">
            {['Агора', 'Граждане', 'Венчур', 'Связь', 'Лестница', 'Арион'].map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`flex-1 py-3 px-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                  activeTab === i 
                    ? 'bg-white text-polis-green shadow-sm' 
                    : 'text-slate-500 hover:text-polis-green hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {activeTab === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {(!userData?.role || userData?.role === 'applicant') && !isAdmin && (
                  <div className="bg-polis-green p-8 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-polis-copper opacity-10 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
                     <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border border-white/20 shrink-0">
                        <Compass className="w-10 h-10 text-polis-copper animate-pulse" />
                     </div>
                     <div className="flex-1 text-center md:text-left relative z-10">
                        <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Статус: Апликант</h3>
                        <p className="text-white/70 text-sm leading-relaxed max-w-xl">
                           Поздравляем в преддверии Полиса. Чтобы получить полные права гражданина, участвовать в голосованиях и брать задачи, вам необходимо пройти Инициацию.
                        </p>
                     </div>
                     <button 
                       onClick={() => setShowOnboarding(true)}
                       className="px-10 py-5 bg-polis-copper text-white rounded-3xl font-black uppercase text-xs hover:bg-white hover:text-polis-green transition-all shadow-xl group/btn whitespace-nowrap"
                     >
                        Начать Инициацию <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                     </button>
                  </div>
                )}
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <h3 className="text-xl font-black text-polis-green uppercase">Предложения Граждан</h3>
                    <div className="space-y-3">
                       {allProposals.length === 0 && <p className="text-slate-400 italic text-sm">Зал Агоры пуст. Станьте первым, кто предложит идею.</p>}
                       {allProposals.map(p => (
                         <div key={p.id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex justify-between items-start">
                            <div>
                               <p className="text-sm font-medium text-slate-700 mb-2">"{p.text}"</p>
                               <div className="flex gap-3 text-[10px] font-bold uppercase text-slate-400">
                                  <span>Автор: {p.author}</span>
                                  <span>•</span>
                                  <span className="text-polis-copper">{p.votes || 0} Голосов</span>
                               </div>
                            </div>
                            <button 
                               onClick={() => handleVote(p.id)}
                               disabled={votedProposalIds.includes(p.id)}
                               className={`p-2 border rounded-lg transition-all ${
                                  votedProposalIds.includes(p.id) 
                                  ? 'bg-polis-green text-white border-polis-green' 
                                  : 'border-slate-100 hover:bg-polis-green/10 text-polis-green'
                               }`}
                             >
                               <ThumbsUp className="w-4 h-4" />
                            </button>
                         </div>
                       ))}
                    </div>
                  </div>
                  <div className="w-full md:w-80 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <h3 className="text-sm font-black text-polis-green uppercase mb-4">Выдвинуть идею</h3>
                    <form onSubmit={handleSubmitProposal} className="space-y-4">
                       <textarea 
                        value={proposalText}
                        onChange={(e) => setProposalText(e.target.value)}
                        placeholder="Опишите ваше предложение для Контура Развития..." 
                        className="w-full h-32 bg-white border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-polis-copper outline-none"
                       />
                       <button 
                        type="submit"
                        disabled={proposalSending || !user}
                        className="w-full bg-polis-green text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
                       >
                          {proposalSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Lightbulb className="w-4 h-4" /> Внести в реестр</>}
                       </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                   <div>
                      <h3 className="text-xl font-black text-polis-green uppercase italic tracking-tighter">Реестр Граждан (Hub)</h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{allProfiles.length} в Контуре</span>
                   </div>
                   <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Поиск по имени или роли..." 
                        value={registrySearch}
                        onChange={(e) => setRegistrySearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-polis-copper outline-none"
                      />
                   </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                   {allProfiles
                    .filter(p => !registrySearch || 
                      p.displayName?.toLowerCase().includes(registrySearch.toLowerCase()) || 
                      p.role?.toLowerCase().includes(registrySearch.toLowerCase())
                    )
                    // Ensure unique UIDs in display
                    .filter((p, idx, self) => self.findIndex(s => s.uid === p.uid) === idx)
                    .map((p) => {
                       const isAI = p.isAI || p.uid?.startsWith('synth_') || p.uid?.startsWith('founding_');
                       const isSelf = user?.uid === p.uid;
                       return (
                        <div key={p.id} className={`p-4 bg-white border rounded-3xl shadow-sm text-center group transition-all relative overflow-hidden h-full flex flex-col items-center min-h-[200px] ${isAI ? 'border-indigo-100 hover:border-indigo-400 bg-indigo-50/10' : 'border-slate-100 hover:border-polis-copper'}`}>
                            {isAI && (
                               <div className="absolute top-2 right-2 p-1">
                                  <Cpu className="w-3 h-3 text-indigo-400 opacity-20 group-hover:opacity-100 transition-opacity" />
                               </div>
                            )}
                            <div className="relative mb-3 flex-shrink-0">
                               {p.avatarUrl ? (
                                 <img 
                                   src={p.avatarUrl} 
                                   alt={p.displayName} 
                                   referrerPolicy="no-referrer"
                                   className={`w-12 h-12 rounded-full mx-auto object-cover border-4 transition-all group-hover:scale-110 ${isAI ? 'border-indigo-100' : 'border-slate-50'}`} 
                                 />
                               ) : (
                                 <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center text-white ring-4 transition-all ${isAI ? 'bg-indigo-600 ring-indigo-50' : 'bg-slate-900 ring-slate-50 group-hover:ring-polis-copper/20'}`}>
                                    {isAI ? <Cpu className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                 </div>
                               )}
                            </div>
                           <div className="text-xs font-black text-slate-800 truncate mb-1 w-full">{p.displayName}</div>
                           <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full inline-block mb-1 ${isAI ? 'bg-indigo-600 text-white shadow-sm' : 'bg-polis-copper/5 text-polis-copper'}`}>
                              {p.role}
                           </div>
                           {isAI && <div className="text-[7px] font-black uppercase text-indigo-400 tracking-[0.2em] mt-0.5 mb-2">Synthetic</div>}
                           
                           {p.badges && p.badges.length > 0 && (
                              <div className="flex justify-center gap-1 mt-2">
                                 {p.badges.slice(0, 3).map((bId: string) => (
                                    <span key={bId} className="text-[10px]" title={BADGES.find(b => b.id === bId)?.name}>
                                       {BADGES.find(b => b.id === bId)?.icon}
                                    </span>
                                 ))}
                                 {p.badges.length > 3 && <span className="text-[8px] text-slate-400 font-bold">+{p.badges.length - 3}</span>}
                              </div>
                           )}
                           
                           <div className="mt-auto pt-3 border-t border-slate-50 w-full flex flex-col gap-2">
                              {!isSelf && (
                               <button 
                                  onClick={() => {
                                    setActiveDirectChat(p);
                                    setIsMessengerOpen(true);
                                  }}
                                  className={`w-full py-2 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all shadow-sm ${isAI ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-900 text-white hover:bg-polis-green'}`}
                                >
                                   <MessageSquare className="w-3.5 h-3.5" /> Написать эксперту
                                </button>
                              )}
                              <div className="flex justify-center gap-4">
                                <div className="text-[9px] font-bold text-slate-400 uppercase">R: <span className="text-slate-800">{p.reputation}%</span></div>
                              </div>
                           </div>
                        </div>
                       );
                    })}
                </div>
              </motion.div>
            )}

            {activeTab === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                 <div className="bg-indigo-950 p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden border-4 border-indigo-500/20">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-12">
                       <div className="max-w-xl">
                          <div className="flex items-center gap-3 mb-4">
                             <div className="p-3 bg-indigo-500 rounded-2xl text-white">
                                <TrendingUp className="w-6 h-6" />
                             </div>
                             <h3 className="text-3xl font-black italic tracking-tighter uppercase">Венчурный Контур</h3>
                          </div>
                          <p className="text-indigo-200 text-lg italic leading-relaxed mb-8">
                             Полис поддерживает коммерческие инициативы граждан. Арион-Менеджер поможет спроектировать архитектуру стартапа, а Лаборатория выделит Мерит на запуск.
                          </p>
                          
                          <div className="flex flex-col gap-4">
                             <input 
                               type="text" 
                               placeholder="Тема проекта (напр. 'Единый реестр недвижимости мира')" 
                               className="w-full bg-indigo-900/50 border-2 border-indigo-500/30 rounded-3xl p-5 text-sm focus:ring-2 focus:ring-indigo-400 outline-none text-white placeholder:text-indigo-700"
                               onKeyDown={(e) => {
                                 if (e.key === 'Enter') handleProposeProject(e.currentTarget.value);
                               }}
                             />
                             <button 
                               onClick={() => {
                                 const input = document.querySelector('input[placeholder*="Единый реестр"]') as HTMLInputElement;
                                 if (input) handleProposeProject(input.value);
                               }}
                               disabled={isGeneratingProject}
                               className="px-8 py-5 bg-indigo-500 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-indigo-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                             >
                                {isGeneratingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Генерация Проекта Арионом</>}
                             </button>
                          </div>
                       </div>
                       
                       <div className="flex-1 w-full">
                          <AnimatePresence mode="wait">
                             {projectProposal ? (
                               <motion.div 
                                 initial={{ opacity: 0, x: 20 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 exit={{ opacity: 0, x: -20 }}
                                 className="bg-white/10 backdrop-blur-md rounded-[3rem] p-8 border border-white/20"
                               >
                                   <div className="text-[10px] font-black uppercase text-indigo-400 mb-6 tracking-[0.3em]">Редактирование Предложения</div>
                                   <div className="space-y-4 mb-6">
                                      <div>
                                         <label className="text-[8px] font-black uppercase text-indigo-300 opacity-60 mb-1 block">Название проекта</label>
                                         <input 
                                           type="text" 
                                           value={projectProposal.title} 
                                           onChange={(e) => setProjectProposal({...projectProposal, title: e.target.value})}
                                           className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-lg font-black italic focus:ring-1 focus:ring-indigo-400 outline-none text-white transition-all shadow-inner"
                                         />
                                      </div>
                                      <div>
                                         <label className="text-[8px] font-black uppercase text-indigo-300 opacity-60 mb-1 block">Слоган / Девиз</label>
                                         <textarea 
                                           value={projectProposal.slogan} 
                                           onChange={(e) => setProjectProposal({...projectProposal, slogan: e.target.value})}
                                           className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold italic text-indigo-200 focus:ring-1 focus:ring-indigo-400 outline-none transition-all shadow-inner"
                                         />
                                      </div>
                                   </div>
                                  
                                   <div className="space-y-4 mb-4">
                                      <div>
                                         <label className="text-[8px] font-black uppercase text-indigo-300 opacity-60 mb-1 block">Техническое Описание</label>
                                         <textarea 
                                           value={projectProposal.description} 
                                           onChange={(e) => setProjectProposal({...projectProposal, description: e.target.value})}
                                           className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] leading-relaxed opacity-80 h-24 focus:ring-1 focus:ring-indigo-400 outline-none text-white scrollbar-thin scrollbar-thumb-white/10"
                                         />
                                      </div>
                                      <div>
                                         <label className="text-[8px] font-black uppercase text-indigo-300 opacity-60 mb-1 block">Стек (через запятую)</label>
                                         <input 
                                           type="text" 
                                           value={projectProposal.techStack?.join(', ')} 
                                           onChange={(e) => setProjectProposal({...projectProposal, techStack: e.target.value.split(',').map(s => s.trim())})}
                                           className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] focus:ring-1 focus:ring-indigo-400 outline-none text-white"
                                         />
                                      </div>
                                   </div>

                                   <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-3xl mb-8">
                                      <div className="text-[9px] font-black uppercase text-indigo-300 mb-3 flex items-center gap-2">
                                         <Users className="w-3 h-3" /> Структура Команды
                                      </div>
                                      <div className="space-y-2">
                                         {projectProposal.positions?.map((pos: any, idx: number) => (
                                           <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-xl">
                                              <div className="flex justify-between items-center mb-1">
                                                 <div className="text-[10px] font-black uppercase text-indigo-200">{pos.title}</div>
                                                 <div className="px-2 py-0.5 bg-indigo-500/20 rounded-md text-[7px] font-black uppercase text-indigo-300 border border-indigo-500/30">
                                                    {pos.requiredRole}
                                                 </div>
                                              </div>
                                              <div className="text-[9px] text-slate-400 italic leading-tight">{pos.description}</div>
                                           </div>
                                         ))}
                                      </div>
                                   </div>

                                   <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-3xl mb-8">
                                      <div className="text-[9px] font-black uppercase text-indigo-300 mb-3 flex items-center gap-2">
                                         <MessageSquare className="w-3 h-3" /> Уточнить с Арионом
                                      </div>
                                      <div className="flex gap-2 text-white">
                                         <input 
                                           type="text" 
                                           placeholder="Напр: 'Используй PostgreSQL вместо NoSQL'" 
                                           value={refineFeedback}
                                           onChange={(e) => setRefineFeedback(e.target.value)}
                                           className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] focus:ring-1 focus:ring-indigo-400 outline-none"
                                           onKeyDown={(e) => { if (e.key === 'Enter') handleRefineProject(); }}
                                         />
                                         <button 
                                           onClick={handleRefineProject}
                                           disabled={isGeneratingProject || !refineFeedback.trim()}
                                           className="p-2 bg-indigo-500 text-white rounded-xl hover:bg-white hover:text-indigo-900 transition-all disabled:opacity-50"
                                         >
                                            {isGeneratingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                         </button>
                                      </div>
                                   </div>

                                   <div className="grid grid-cols-2 gap-4 mb-8">
                                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                                         <div className="text-[8px] font-black uppercase opacity-50 mb-2">Мерит-Бюджет</div>
                                         <div className="relative flex items-center">
                                            <span className="absolute left-3 text-indigo-400 font-black italic text-sm">§</span>
                                            <input 
                                              type="number"
                                              value={projectProposal.meritBudget}
                                              onChange={(e) => setProjectProposal({...projectProposal, meritBudget: parseInt(e.target.value) || 0})}
                                              className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-2 py-2 text-xl font-black italic text-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none text-center transition-all shadow-inner"
                                            />
                                         </div>
                                      </div>
                                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center flex flex-col justify-center">
                                         <div className="text-[8px] font-black uppercase opacity-50 mb-1">Стадия</div>
                                         <div className="text-xl font-black italic text-green-400">Готов к запуску</div>
                                      </div>
                                   </div>

                                  <div className="flex gap-4">
                                     <button 
                                       onClick={handleLaunchProject}
                                       className="flex-1 bg-white text-indigo-900 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-400 hover:text-white transition-all shadow-xl"
                                     >
                                        Инициировать Проект
                                     </button>
                                     <button 
                                       onClick={() => setProjectProposal(null)}
                                       className="px-6 bg-white/5 text-white hover:bg-white/10 rounded-2xl transition-all"
                                     >
                                        Сброс
                                     </button>
                                  </div>
                               </motion.div>
                             ) : (
                               <div className="h-full flex items-center justify-center p-12 border-2 border-dashed border-indigo-500/30 rounded-[3rem] opacity-30 italic text-xs text-center leading-relaxed">
                                  Опишите идею и нажмите «Генерация». <br /> Арион подготовит технический паспорт и распределение ролей.
                               </div>
                             )}
                          </AnimatePresence>
                       </div>
                    </div>
                    
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
                 </div>

                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {allProjects.map(proj => (
                      <div key={proj.id} className="p-8 bg-white border border-slate-200 rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col">
                         <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                               <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                  <TrendingUp className="w-6 h-6" />
                               </div>
                               <div>
                                  <h5 className="text-xl font-black italic tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors uppercase">{proj.title}</h5>
                                  <div className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{proj.status}</div>
                               </div>
                            </div>
                         </div>
                         <p className="text-sm font-medium text-slate-600 leading-relaxed mb-8 flex-1 italic">
                            «{proj.slogan}» — {proj.objective}
                         </p>
                         
                         <div className="space-y-4 mb-8">
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between gap-2">
                               <div className="flex items-center gap-2"><Users className="w-3 h-3" /> Команда:</div>
                               <button 
                                 onClick={() => setJoiningProjectId(joiningProjectId === proj.id ? null : proj.id)}
                                 className="px-4 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-full hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                               >
                                  {joiningProjectId === proj.id ? 'Отмена' : 'Присоединиться'}
                               </button>
                            </div>
                            
                            <AnimatePresence>
                               {joiningProjectId === proj.id && (
                                 <motion.div 
                                   initial={{ height: 0, opacity: 0 }}
                                   animate={{ height: 'auto', opacity: 1 }}
                                   exit={{ height: 0, opacity: 0 }}
                                   className="overflow-hidden bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 mb-4"
                                 >
                                    <div className="text-[8px] font-black uppercase text-indigo-400 mb-3 tracking-widest text-center">Выберите вашу роль:</div>
                                    <div className="grid grid-cols-1 gap-2">
                                       {proj.positions?.map((pos: any) => (
                                         <button 
                                           key={pos.title}
                                           onClick={() => {
                                             handleJoinProject(proj, pos.title);
                                             setJoiningProjectId(null);
                                           }}
                                           className="w-full p-3 bg-white border border-indigo-100 rounded-xl text-left hover:border-indigo-500 hover:shadow-sm transition-all group/role"
                                         >
                                            <div className="text-[10px] font-black uppercase text-indigo-900 group-hover/role:text-indigo-600">{pos.title}</div>
                                            <div className="text-[8px] font-medium text-slate-500 leading-tight">{pos.description}</div>
                                         </button>
                                       ))}
                                    </div>
                                 </motion.div>
                               )}
                            </AnimatePresence>

                            <div className="flex flex-wrap gap-2">
                               {proj.positions?.slice(0, 3).map((pos: any) => (
                                 <div key={pos.title} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[8px] font-black uppercase text-slate-400 flex flex-col">
                                    <span>{pos.title}</span>
                                 </div>
                               ))}
                               {proj.positions?.length > 3 && (
                                 <div className="px-3 py-1 text-[8px] font-black text-slate-300 uppercase">+ {proj.positions.length - 3} еще</div>
                               )}
                            </div>
                         </div>

                         <div className="pt-6 border-t border-dashed border-slate-100 flex justify-between items-center mt-auto">
                            <div className="flex items-center gap-3">
                               <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">§ {proj.meritBudget || 0} Капитал</div>
                            </div>
                            <button 
                              onClick={() => setNotification(`Проект «${proj.title}» в стадии развития.`)}
                              className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-indigo-600 transition-all shadow-lg"
                            >
                               <ChevronRight className="w-5 h-5" />
                            </button>
                         </div>
                         
                         <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                            <Zap className="w-24 h-24 text-indigo-900" />
                         </div>
                      </div>
                    ))}
                    {allProjects.length === 0 && (
                      <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-400 font-bold uppercase">
                         Нет активных проектов в Контуре
                      </div>
                    )}
                 </div>
              </motion.div>
            )}

            {activeTab === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[500px] bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                   <h3 className="text-xs font-black text-polis-green uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Глобальный Поток (Feed)
                   </h3>
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
                   {allMessages.map((m) => {
                      const profile = allProfiles.find(p => p.uid === m.uid);
                      const isAI = profile?.isAI || m.uid?.startsWith('synth_');
                      return (
                       <div key={m.id} className={`flex flex-col ${m.uid === user?.uid ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2 mb-1">
                             {profile?.avatarUrl ? (
                               <img src={profile.avatarUrl} alt="" className={`w-4 h-4 rounded-full border ${isAI ? 'border-indigo-400 p-0.5' : 'border-slate-200'}`} referrerPolicy="no-referrer" />
                             ) : (
                               isAI ? <Cpu className="w-3 h-3 text-indigo-500" /> : <User className="w-3 h-3 text-slate-400" />
                             )}
                             <span className={`text-[8px] font-black uppercase ${isAI ? 'text-indigo-600' : 'text-slate-400'}`}>
                               {m.author} {isAI && '• Synthetic'}
                             </span>
                          </div>
                          <div className={`max-w-[80%] p-3 rounded-2xl text-xs shadow-sm ${
                            m.uid === user?.uid 
                              ? 'bg-polis-green text-white rounded-tr-none' 
                              : isAI 
                                ? 'bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-tl-none italic font-medium' 
                                : 'bg-slate-100 text-slate-700 rounded-tl-none'
                          }`}>
                             {m.text}
                          </div>
                       </div>
                      );
                   })}
                   {allMessages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 italic text-sm">
                         Узелы связи свободны. Начните общение.
                      </div>
                   )}
                </div>

                <form onSubmit={handleSendMessage} className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
                   <input 
                    type="text" 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Напишите сообщение в Контур..." 
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-polis-copper"
                   />
                   <button 
                    type="submit"
                    disabled={!user || !messageInput.trim()}
                    className="p-2 bg-polis-green text-white rounded-xl hover:bg-polis-green/90 transition-all disabled:opacity-50"
                   >
                      <Send className="w-4 h-4" />
                   </button>
                </form>
              </motion.div>
            )}

            {activeTab === 4 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { level: "1-2", name: "Участник", weight: "1.0", bg: "bg-slate-200", icon: Shield },
                  { level: "3-5", name: "Деятель", weight: "2.5", bg: "bg-polis-copper/10", icon: Zap },
                  { level: "6-9", name: "Архитектор", weight: "5.0", bg: "bg-polis-copper/30", icon: Target },
                  { level: "10+", name: "Магистр", weight: "10.0", bg: "bg-polis-green text-white", icon: Award }
                ].map(step => (
                  <div key={step.name} className={`p-6 rounded-2xl flex flex-col justify-between h-48 border border-white/20 relative overflow-hidden ${step.bg}`}>
                    <step.icon className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10" />
                    <div className="relative z-10">
                      <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">Уровень {step.level}</span>
                      <h4 className="text-xl font-black italic">{step.name}</h4>
                    </div>
                    <div className="relative z-10">
                      <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">Вес голоса (W)</span>
                      <div className="text-3xl font-black tracking-tighter">{step.weight}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 4 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                       <History className="w-5 h-5 text-polis-copper" /> Event-Driven Reality
                    </h3>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Обновление в реальном времени</div>
                 </div>
                 <div className="space-y-4 max-h-80 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-800">
                    {[
                      { event: "Запись в Kazan", detail: "Гражданин #12 внес взнос 7%", time: "2 мин назад" },
                      { event: "Новое Прошение", detail: "Адепт подал заявку по Пути Мастера", time: "15 мин назад" },
                      { event: "Голос на Агоре", detail: "Архитектор поддержал идею «Аудит Репутации»", time: "1 час назад" },
                      { event: "Инициация", detail: "Новый гражданин принес Присягу", time: "3 часа назад" }
                    ].map((ev, i) => (
                      <div key={i} className="flex gap-4 items-start border-l-2 border-slate-800 pl-4 py-1">
                         <div className="w-2 h-2 rounded-full bg-polis-copper mt-1.5" />
                         <div>
                            <div className="text-xs font-black text-polis-copper uppercase">{ev.event}</div>
                            <div className="text-sm text-slate-400">{ev.detail}</div>
                            <div className="text-[10px] text-slate-600 font-mono mt-1">{ev.time}</div>
                         </div>
                      </div>
                    ))}
                 </div>
              </motion.div>
            )}

            {activeTab === 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-start">
                <div className="bg-polis-green p-4 rounded-2xl">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-polis-green mb-2 uppercase">АРИОН (AI-АССИСТЕНТ)</h3>
                  <p className="text-slate-600 mb-4 max-w-2xl">
                    Нейтральный Аудитор и Хранитель Контура Развития. Он обеспечивает соблюдение Конституции алгоритмически, фильтрует предложения на основе их влияния на метрики системы.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <span className="px-3 py-1 bg-slate-100 text-xs font-bold rounded-full border border-slate-200">АНТИ-КОРРУПЦИЯ</span>
                    <span className="px-3 py-1 bg-slate-100 text-xs font-bold rounded-full border border-slate-200">АЛГОРИТМИЧЕСКОЕ ПРАВО</span>
                    <button onClick={() => setChatOpen(true)} className="px-3 py-1 bg-polis-copper/10 text-polis-copper text-xs font-bold rounded-full hover:bg-polis-copper/20 transition-all uppercase">Связаться в Контуре</button>
                    {isMediator && (
                      <button 
                        onClick={() => setIsMediatorView(!isMediatorView)}
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase transition-all border ${
                          isMediatorView ? 'bg-polis-copper text-white border-polis-copper' : 'border-polis-copper text-polis-copper hover:bg-polis-copper/10'
                        }`}
                      >
                        {isMediatorView ? 'Закрыть Пульт Медиатора' : 'Пульт Медиатора'}
                      </button>
                    )}
                    {isAdmin && (
                      <button 
                        onClick={() => setIsAdminConfigOpen(!isAdminConfigOpen)}
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase transition-all border ${
                          isAdminConfigOpen ? 'bg-polis-green text-white border-polis-green' : 'border-polis-green text-polis-green hover:bg-polis-green/10'
                        }`}
                      >
                        {isAdminConfigOpen ? 'Закрыть Настройку' : 'Настройка Ариона'}
                      </button>
                    )}
                  </div>
                  {isMediatorView && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 pt-8 border-t border-slate-100 grid md:grid-cols-2 gap-8">
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <h4 className="text-sm font-black text-polis-green uppercase mb-4 flex items-center gap-2">
                           <Shield className="w-4 h-4 text-polis-copper" /> Генератор Поручений (Role: Mediator)
                        </h4>
                        <div className="space-y-4">
                           <div className="text-xs text-slate-500 italic mb-4">
                             Медиатор может запросить у Ариона индивидуальную задачу для управления потоком мерита.
                           </div>
                           <button 
                             onClick={handleRequestTask}
                             disabled={isTaskExecuting}
                             className="w-full bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-polis-green transition-all disabled:opacity-50"
                           >
                             {isTaskExecuting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Запросить проект у Ариона"}
                           </button>
                           {assignedTask && (
                             <div className="mt-4 p-4 bg-white border border-polis-copper/30 rounded-xl">
                               <div className="text-[10px] font-black uppercase text-polis-copper mb-1 italic">Результат анализа:</div>
                               <div className="font-bold text-slate-800 mb-2">{assignedTask.title}</div>
                               <button 
                                 onClick={async () => {
                                   if (assignedTask && user) {
                                     await addDoc(collection(db, 'global_tasks'), {
                                       ...assignedTask,
                                       status: 'open',
                                       mediatorUid: user.uid,
                                       createdAt: serverTimestamp()
                                     });
                                     setNotification(`Проект "${assignedTask.title}" опубликован в реестр.`);
                                     setAssignedTask(null);
                                   }
                                 }}
                                 className="text-[9px] font-black uppercase text-polis-green hover:underline"
                               >
                                 Опубликовать в реестр
                               </button>
                             </div>
                           )}
                        </div>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <h4 className="text-sm font-black text-polis-green uppercase mb-4 flex items-center gap-2">
                           <History className="w-4 h-4 text-polis-copper" /> Поток Баланса
                        </h4>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 border-b border-slate-100 pb-2 uppercase">
                              <span>Субъект</span>
                              <span>Коэффициент (K)</span>
                           </div>
                           {allUsers.slice(0, 5).map(u => (
                             <div key={u.uid} className="flex justify-between items-center text-xs py-1">
                                <span className="text-slate-700">{u.displayName}</span>
                                <span className="font-mono text-polis-copper">1.2{Math.floor(Math.random()*9)}</span>
                             </div>
                           ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </Section>

        {/* Section 4: Join / User Dashboard */}
        <Section title={user ? "4. ВАШЕ ПРОШЕНИЕ" : "4. ПУТЬ ГРАЖДАНСТВА"} id="join" icon={Key}>
          {!user ? (
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-4xl font-black text-polis-green leading-tight">ТРИ КЛЮЧА К ВХОДУ</h3>
                <p className="text-slate-500 text-lg">Войдите в систему, чтобы подать прошение о вступлении в Полис.</p>
                <div className="space-y-4">
                  {[
                    { title: "Путь Мастера", desc: "Предоставление профессиональных навыков.", icon: Zap },
                    { title: "Путь Философа", desc: "Создание смыслов, чертежей и идей.", icon: BookOpen },
                    { title: "Путь Мецената", desc: "Вклад материальных ресурсов и инструментов.", icon: Users }
                  ].map(path => (
                    <div key={path.title} className="flex gap-4 items-center p-4 rounded-2xl">
                      <div className="w-12 h-12 bg-polis-copper/10 rounded-full flex items-center justify-center text-polis-copper">
                        <path.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-black text-polis-green uppercase tracking-tight">{path.title}</div>
                        <div className="text-sm text-slate-500">{path.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={handleLogin}
                  className="w-full bg-polis-green text-white py-4 rounded-full font-bold text-xl hover:bg-polis-green/90 transition-all shadow-lg"
                >
                  АВТОРИЗОВАТЬСЯ ЧЕРЕЗ GOOGLE
                </button>
              </div>
              <div className="bg-polis-green text-white p-12 rounded-[3rem] flex flex-col justify-center text-center">
                <h4 className="text-2xl font-bold mb-4">Испытательный Срок</h4>
                <div className="text-6xl font-black mb-4">2 НЕДЕЛИ</div>
                <p className="text-polis-copper font-medium">Для каждого адепта цифровой агоры.</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-12">
              {petitionSuccess ? (
                <div className="bg-white border-2 border-polis-copper p-8 rounded-3xl text-center space-y-4">
                  <div className="w-20 h-20 bg-polis-copper/10 text-polis-copper rounded-full mx-auto flex items-center justify-center">
                    <Zap className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-polis-green uppercase">Прошение принято</h3>
                  <p className="text-slate-600">Ваше прошение отправлено на проверку в Агору. Ответ придет в течение ближайшего цикла.</p>
                  <button onClick={() => setPetitionSuccess(false)} className="text-polis-copper font-bold uppercase text-sm border-b border-polis-copper">Подать еще одно</button>
                </div>
              ) : (
                <div className="space-y-6 bg-white p-8 rounded-3xl border border-slate-200">
                  <h3 className="text-2xl font-black text-polis-green">ПОДАТЬ ПРОШЕНИЕ</h3>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-2">Выберите Ключ</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['master', 'philosopher', 'patron'].map(p => (
                         <button 
                           key={p} 
                           onClick={() => setPetitionPath(p as any)}
                           className={`py-2 px-1 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                             petitionPath === p ? 'bg-polis-copper text-white border-polis-copper' : 'border-slate-200 text-slate-500'
                           }`}
                         >
                           {p === 'master' ? '1. Мастер' : p === 'philosopher' ? '2. Философ' : '3. Патрон'}
                         </button>
                       ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-2">Ваше послание Ордену</label>
                    <textarea 
                      value={petitionMessage}
                      onChange={(e) => setPetitionMessage(e.target.value)}
                      placeholder="Опишите ваш потенциальный вклад в Полис..."
                      className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-polis-copper focus:border-transparent transition-all outline-none text-slate-700"
                    />
                  </div>
                  <button 
                    onClick={handlePetitionSubmit}
                    disabled={petitionSending || !petitionMessage.trim()}
                    className="w-full bg-polis-green text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-polis-green/90 disabled:opacity-50 transition-all"
                  >
                    {petitionSending ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Отправить в Агору"}
                  </button>
                </div>
              )}
              
              <div className="bg-slate-900 text-white p-8 rounded-3xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <User className="w-5 h-5 text-polis-copper" />
                    <span className="text-xs uppercase font-black tracking-widest text-slate-500">Реестр Гражданина</span>
                  </div>
                  <div className="space-y-6">
                     <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-4">
                         {userData?.avatarUrl && (
                           <img 
                             src={userData.avatarUrl} 
                             alt="Profile Avatar" 
                             referrerPolicy="no-referrer"
                             className="w-16 h-16 rounded-2xl border-2 border-polis-copper shadow-xl" 
                           />
                         )}
                         <div className="text-3xl font-black">{user.displayName}</div>
                       </div>
                       <div className="flex gap-2">
                         <span className="text-polis-copper bg-polis-copper/10 px-2 py-0.5 rounded text-[10px] font-black uppercase">{userData?.role}</span>
                         <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[10px] font-black uppercase">VETO: ACTIVE</span>
                       </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                          <div className="text-[10px] text-slate-500 uppercase font-black mb-1">Репутация (R)</div>
                          <div className="text-2xl font-black text-polis-copper">
                            {calculateReputation(userData?.successfulDeeds || 0, userData?.totalAssignments || 0)}%
                          </div>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                          <div className="text-[10px] text-slate-500 uppercase font-black mb-1">Вес Голоса (W)</div>
                          <div className="text-2xl font-black">
                            {calculateWeight(userData?.role || 'applicant')}
                          </div>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                          <div className="text-[10px] text-slate-500 uppercase font-black mb-1">Мерит (Вклад)</div>
                          <div className="text-2xl font-black flex items-center gap-2">
                            {userData?.meritPoints || 0}
                            <Award className="w-4 h-4 text-polis-copper" />
                          </div>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 group cursor-pointer hover:border-polis-copper transition-all">
                          <div className="text-[10px] text-slate-500 uppercase font-black mb-1 flex justify-between items-center">
                             <span>Ключ Приглашения</span>
                             <Share2 className="w-3 h-3 group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="text-xs font-mono font-black text-polis-copper mt-2">POLIS-REF-3904</div>
                        </div>
                     </div>

                     <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <div className="text-[10px] text-slate-500 uppercase font-black mb-3 italic">Слава Гражданина (Символы)</div>
                        <div className="flex flex-wrap gap-2">
                           {userData?.badges && userData.badges.length > 0 ? (
                              userData.badges.map((bId: string) => {
                                 const badge = BADGES.find(b => b.id === bId);
                                 return (
                                    <div key={bId} title={badge?.desc} className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-lg border border-slate-600 hover:border-polis-copper transition-all cursor-help">
                                       {badge?.icon}
                                    </div>
                                 );
                              })
                           ) : (
                              <div className="text-[9px] text-slate-600 uppercase font-bold">Символов пока нет. Исполняйте поручения.</div>
                           )}
                        </div>
                     </div>

                     <div className="bg-polis-green/20 p-4 rounded-2xl border border-polis-green/30">
                        <div className="flex justify-between items-center mb-4">
                           <span className="text-[10px] uppercase font-black text-polis-green">Направленный поток (Арион)</span>
                           <Briefcase className="w-4 h-4 text-polis-green" />
                        </div>
                        
                        <AnimatePresence mode="wait">
                          {assignedTask ? (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }} 
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              key="active-task" 
                              className="bg-black/30 p-4 rounded-xl border border-polis-green/20"
                            >
                               <div className="text-[10px] font-black uppercase text-polis-copper mb-1 flex justify-between items-center">
                                  <span>{assignedTask.category}</span>
                                  <span className="opacity-50">T{assignedTask.complexity}</span>
                               </div>
                               <div className="font-bold text-sm mb-1 text-white">{assignedTask.title}</div>
                               <div className="text-[10px] text-slate-400 mb-3 leading-relaxed">{assignedTask.description}</div>
                               
                               <div className="flex flex-wrap gap-2 mb-4">
                                  {assignedTask.importance && (
                                    <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                                      assignedTask.importance === 'System-Critical' ? 'bg-red-500/10 border-red-500/50 text-red-500' :
                                      assignedTask.importance === 'High' ? 'bg-orange-500/10 border-orange-500/50 text-orange-500' :
                                      'bg-blue-500/10 border-blue-500/50 text-blue-500'
                                    }`}>
                                       {assignedTask.importance}
                                    </div>
                                  )}
                                  {assignedTask.estimatedTime && (
                                    <div className="text-[8px] font-black uppercase px-2 py-0.5 rounded border border-white/10 bg-white/5 text-slate-400 flex items-center gap-1">
                                       <History className="w-2 h-2" /> {assignedTask.estimatedTime}
                                    </div>
                                  )}
                               </div>

                               <div className="flex justify-between items-center">
                                  <span className="text-polis-green font-black text-xs">§ {assignedTask.reward} Мерита</span>
                                  <button 
                                    onClick={handleExecuteTask}
                                    disabled={isTaskExecuting}
                                    className="bg-polis-green text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-50"
                                  >
                                    {isTaskExecuting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Исполнить"}
                                  </button>
                               </div>
                            </motion.div>
                          ) : (
                            <motion.div 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }}
                              key="no-task"
                              className="text-center py-4"
                            >
                               {globalTasks.length > 0 ? (
                                 <div className="space-y-3 text-left">
                                   <div className="text-[9px] font-black text-slate-500 uppercase mb-2">Доступные поручения:</div>
                                   {globalTasks.map(task => (
                                      <div key={task.id} className="p-3 border border-slate-700/50 rounded-xl bg-slate-900/50">
                                         <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-black uppercase text-polis-copper">{task.category}</span>
                                            <span className="text-polis-green font-bold text-[10px]">§ {task.reward}</span>
                                         </div>
                                         <div className="text-xs font-bold text-white mb-2 leading-tight">{task.title}</div>
                                         <button 
                                           onClick={() => handleClaimTask(task)}
                                           disabled={!!isTaskClaiming}
                                           className="w-full text-[9px] font-black uppercase bg-slate-800 text-slate-300 py-2 rounded hover:bg-polis-green hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                         >
                                           {isTaskClaiming === task.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Принять Поручение"}
                                         </button>
                                      </div>
                                   ))}
                                 </div>
                               ) : (
                                 <p className="text-[10px] text-slate-500 font-bold uppercase mb-4 tracking-tighter">Ожидание поручений от Медиаторов...</p>
                               )}
                               
                               {isMediator && (
                                 <button 
                                   onClick={handleRequestTask}
                                   className="w-full border border-polis-green text-polis-green hover:bg-polis-green/10 text-[10px] font-black uppercase py-2 rounded-xl transition-all mt-4"
                                 >
                                   Запросить новый проект у Ариона
                                 </button>
                               )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                     </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-600 font-mono mt-8 italic break-all">
                  CID: {user.uid}
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* Section 5: The Archive */}
        <Section title="5. АРХИВ ОРДЕНА" id="library" icon={Library}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DOCUMENTS.map(doc => (
              <motion.div 
                key={doc.id}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-polis-copper/30 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="mb-6 bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-polis-copper/5 transition-colors">
                    {doc.icon}
                  </div>
                  <h4 className="text-lg font-black text-polis-green uppercase leading-tight mb-2">{doc.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed mb-4">{doc.desc}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-slate-400">
                    <span>{doc.type} • {doc.size}</span>
                    <span>{doc.date}</span>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={() => setOpenDocHistory(prev => ({ ...prev, [doc.id]: !prev[doc.id] }))}
                      className="text-[9px] font-black uppercase text-polis-copper flex items-center gap-1 border-b border-polis-copper/20 hover:border-polis-copper transition-all"
                    >
                      <History className="w-3 h-3" />
                      {openDocHistory[doc.id] ? 'Скрыть историю' : 'История версий'}
                    </button>
                    
                    <AnimatePresence>
                      {openDocHistory[doc.id] && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 space-y-3 pt-4 border-t border-slate-100">
                             {doc.versions?.map((v: any, idx: number) => (
                               <div key={idx} className="relative pl-4 border-l-2 border-slate-100 py-1">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-black text-slate-800">v{v.v}</span>
                                    <span className="text-[8px] font-bold text-slate-400">{v.date}</span>
                                  </div>
                                  <div className="text-[9px] text-slate-500 leading-tight italic">{v.note}</div>
                               </div>
                             ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <a 
                    href={doc.url} 
                    download 
                    className="w-full bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-polis-copper transition-all active:scale-95 text-center"
                  >
                    <Download className="w-3 h-3" />
                    Загрузить документ
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 bg-polis-green/5 border border-polis-green/20 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h4 className="text-xl font-bold text-polis-green mb-2">Запрос на дешифровку</h4>
              <p className="text-slate-600 text-sm italic">Если вы обладаете рангом Мецената, вы можете запросить доступ к закрытым протоколам исследований Ариона.</p>
            </div>
            <button className="bg-polis-green text-white px-8 py-3 rounded-full font-black uppercase text-sm hover:bg-polis-green/90 transition-all whitespace-nowrap">
              Открыть Протоколы
            </button>
          </div>
        </Section>
      </main>
      </>
      )}

      {/* Arion Chat Widget */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <AnimatePresence>
          {chatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-20 right-0 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
            >
              <div className="bg-polis-green p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-polis-copper animate-pulse" />
                  <span className="font-bold uppercase tracking-tighter">АРИОН: Аудитор</span>
                  <span className="text-[8px] px-1.5 py-0.5 bg-white/20 rounded font-black border border-white/10 uppercase tracking-widest">
                    Context: {isAdmin ? 'admin' : (userData?.role || 'applicant')}
                  </span>
                </div>
                <button 
                  onClick={() => setChatOpen(false)} 
                  className="p-1 hover:bg-white/20 rounded-lg transition-all text-white/80 hover:text-white"
                  aria-label="Закрыть чат"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-50">
                 {messages.map((m, i) => (
                   <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        m.role === 'user' 
                          ? 'bg-polis-copper text-white rounded-br-none' 
                          : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-none'
                      }`}>
                        {m.text}
                      </div>
                      
                      {m.role === 'arion' && m.suggestions && m.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {m.suggestions.map((s, si) => (
                            <button
                              key={si}
                              onClick={() => handleArionChat(undefined, s.text)}
                              className="bg-polis-green/10 text-polis-green border border-polis-green/30 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-polis-green hover:text-white transition-all shadow-sm"
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      )}
                   </div>
                 ))}
                 {sending && (
                   <div className="flex justify-start">
                     <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 rounded-bl-none flex items-center gap-2">
                       <Loader2 className="w-3 h-3 animate-spin text-polis-copper" />
                       <span className="text-[10px] font-black uppercase text-slate-400 animate-pulse tracking-widest">Арион размышляет...</span>
                     </div>
                   </div>
                 )}
                 <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleArionChat} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Задайте вопрос о Конституции..."
                  className="flex-1 text-sm outline-none bg-slate-100 p-2 rounded-xl focus:ring-1 focus:ring-polis-copper"
                />
                <button type="submit" disabled={sending} className="bg-polis-green text-white p-2 rounded-xl hover:bg-polis-green/90 transition-all">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setChatOpen(!chatOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 ${
            chatOpen ? 'bg-polis-copper' : 'bg-polis-green'
          }`}
        >
          {chatOpen ? <ChevronRight className="w-6 h-6 text-white rotate-90" /> : <MessageSquare className="w-6 h-6 text-white" />}
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-24 px-6 border-t-8 border-polis-copper">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-24 mb-16">
            <div>
              <div className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 bg-polis-copper rounded-full flex items-center justify-center p-1.5">
                  <Circle className="text-white fill-white" />
                </div>
                <span className="font-black text-3xl tracking-tighter">POLIS</span>
              </div>
              <p className="text-slate-400 text-xl leading-relaxed italic">
                «Служи ордену — и орден будет служить тебе».
              </p>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="text-slate-500 text-sm uppercase tracking-widest font-black mb-4">Присяга Гражданина</div>
              <p className="text-2xl font-light text-slate-300 max-w-sm italic">
                «Обязуюсь служить Ордену и принимать его служение мне».
              </p>
            </div>
          </div>
          <div className="pt-16 border-t border-slate-800 flex justify-between items-center text-xs font-bold text-slate-500 tracking-widest uppercase">
            <span>Open Order Polis © 2026</span>
            <span>Living Code: v{CURRENT_VERSION.version}</span>
          </div>
        </div>
      </footer>

      {/* Admin Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-24 right-6 z-[70] bg-polis-green text-white p-4 rounded-2xl shadow-2xl border-l-4 border-polis-copper flex items-center gap-4 cursor-pointer"
            onClick={() => { setIsAdminView(true); setAdminTab('petitions'); setNotification(null); }}
          >
            <div className="bg-polis-copper p-2 rounded-lg">
               <Zap className="w-5 h-5" />
            </div>
            <div>
               <div className="text-[10px] font-black uppercase text-polis-copper">Уведомление Магистра</div>
               <div className="font-bold">{notification}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Upgrade Modal */}
      <AnimatePresence>
        {roleUpgradePrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white max-w-md w-full rounded-[3rem] overflow-hidden shadow-2xl border border-polis-copper/30"
            >
              <div className="bg-polis-green p-8 text-center relative overflow-hidden">
                < Award className="w-24 h-24 text-white/10 absolute -right-4 -bottom-4 rotate-12" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-polis-copper rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Эволюция Статуса</h3>
                  <p className="text-polis-copper text-xs font-bold uppercase tracking-widest mt-1">Признание Ордена</p>
                </div>
              </div>
              <div className="p-8 text-center">
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Ваш вклад в Полис отмечен Арионом. Ваши достижения позволяют вам перейти из ранга 
                  <span className="font-black text-polis-green"> {roleUpgradePrompt.from} </span> 
                  в ранг 
                  <span className="font-black text-polis-copper text-lg uppercase italic"> {roleUpgradePrompt.to} </span>.
                </p>
                <div className="bg-slate-50 p-4 rounded-2xl mb-8 border border-slate-100 italic text-[11px] text-slate-500">
                  «С новым рангом приходит новый вес голоса и доступ к более сложным протоколам управления».
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleConfirmRoleUpgrade}
                    className="w-full bg-polis-green text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-polis-green/90 transition-all shadow-xl shadow-polis-green/20 active:scale-95"
                  >
                    Принять новый ранг
                  </button>
                  <button 
                    onClick={() => setRoleUpgradePrompt(null)}
                    className="text-slate-400 text-[10px] font-bold uppercase hover:text-polis-copper transition-colors"
                  >
                    Рассмотрю позже
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Messenger Interface */}
      <AnimatePresence>
        {isMessengerOpen && (
          <div 
            className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-4 bg-slate-900/80 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) setIsMessengerOpen(false); }}
          >
            <motion.div 
               initial={{ opacity: 0, y: 100, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 100, scale: 0.95 }}
               className="bg-white w-full max-w-5xl h-full sm:h-[80vh] rounded-none sm:rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 flex flex-col md:flex-row"
            >
               {/* Contacts Sidebar */}
               <div className={`w-full md:w-80 border-r border-slate-100 bg-slate-50 flex flex-col shrink-0 ${activeDirectChat ? 'hidden md:flex' : 'flex'}`}>
                  <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase italic text-polis-green tracking-tighter">Мессенджер Контура</h3>
                    <button 
                      onClick={() => setIsMessengerOpen(false)} 
                      className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all text-slate-400 group"
                      title="Закрыть мессенджер"
                    >
                      <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                  </div>
                  <div className="p-4 border-b border-slate-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="text" 
                        placeholder="Поиск диалогов..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-xs focus:ring-1 focus:ring-polis-copper outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                     {/* Conversations List */}
                     {Array.from(new Set(directMessages.map(m => m.participants.find((p: string) => p !== user?.uid)))).filter(Boolean).map(partnerId => {
                        const partnerProfile = allProfiles.find(p => p.uid === partnerId);
                        const chatMsgs = directMessages.filter(m => m.participants.includes(partnerId)).sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                        const lastMsg = chatMsgs[0];
                        const isOnline = partnerProfile?.isAI; // AI is always online
                        if (!partnerProfile) return null;

                        return (
                          <div 
                            key={partnerId as string}
                            onClick={() => setActiveDirectChat(partnerProfile)}
                            className={`p-4 mx-2 my-1 rounded-2xl cursor-pointer transition-all flex items-center gap-3 group relative ${activeDirectChat?.uid === partnerId ? 'bg-white shadow-sm border border-slate-100 ring-2 ring-polis-copper/10' : 'hover:bg-white hover:shadow-sm'}`}
                          >
                             <div className="relative shrink-0">
                                {partnerProfile.avatarUrl ? (
                                  <img src={partnerProfile.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-100" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-polis-copper text-xs font-black">{partnerProfile.displayName?.[0]}</div>
                                )}
                                {isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                   <div className={`text-[11px] font-black uppercase truncate ${activeDirectChat?.uid === partnerId ? 'text-polis-green' : 'text-slate-700'}`}>{partnerProfile.displayName}</div>
                                   <div className="text-[7px] font-bold text-slate-400 uppercase shrink-0">{lastMsg?.createdAt?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                                <div className="text-[9px] text-slate-500 truncate italic leading-tight">
                                   {lastMsg?.senderId === user?.uid ? 'Вы: ' : ''}{lastMsg?.text}
                                </div>
                             </div>
                             {!lastMsg?.read && lastMsg?.senderId !== user?.uid && (
                               <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-polis-copper rounded-full shadow-sm" />
                             )}
                          </div>
                        );
                     })}
                     
                     {/* Suggest new contacts if empty */}
                     {directMessages.length === 0 && (
                       <div className="p-8 text-center">
                          <div className="text-[10px] font-bold text-slate-400 uppercase mb-4 leading-relaxed">У вас пока нет активных диалогов</div>
                          <button 
                            onClick={() => { setActiveTab(1); setIsMessengerOpen(false); }}
                            className="text-[9px] font-black uppercase text-polis-copper border-b border-polis-copper/20 hover:border-polis-copper pb-0.5"
                          >
                            Перейти в Реестр
                          </button>
                       </div>
                     )}
                  </div>
                  <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                       <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Сеть: Активна</span>
                    </div>
                  </div>
               </div>

               {/* Chat Window */}
               <div className={`flex-1 flex flex-col bg-white relative ${!activeDirectChat ? 'hidden md:flex' : 'flex'}`}>
                  {activeDirectChat ? (
                    <>
                      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 shadow-sm transition-shadow">
                        <div className="flex items-center gap-4">
                           <button 
                             onClick={() => setActiveDirectChat(null)} 
                             className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-all flex items-center gap-1 group"
                             title="Назад к списку"
                           >
                              <ChevronRight className="w-5 h-5 text-slate-400 rotate-180 group-hover:-translate-x-1 transition-transform" />
                              <span className="text-[10px] font-black uppercase text-slate-400">Назад</span>
                           </button>
                           <div className="relative shrink-0">
                              {activeDirectChat.avatarUrl ? (
                                <img src={activeDirectChat.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-slate-100" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-polis-copper text-xs font-black ring-2 ring-slate-50">{activeDirectChat.displayName?.[0]}</div>
                              )}
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                           </div>
                           <div>
                              <div className="text-sm font-black text-polis-green flex items-center gap-2">
                                 {activeDirectChat.displayName}
                                 {activeDirectChat.isAI && <span className="text-[7px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-black tracking-[0.2em] uppercase">Synth</span>}
                              </div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                 {activeDirectChat.role} • {activeDirectChat.isAI ? 'В сети' : 'Был недавно'}
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <button className="p-2 text-slate-400 hover:text-polis-copper transition-colors"><Search className="w-5 h-5" /></button>
                           <button 
                             onClick={() => setIsMessengerOpen(false)} 
                             className="p-2 text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 group"
                             title="Закрыть мессенджер"
                           >
                             <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-red-500 transition-colors hidden lg:inline">Закрыть</span>
                             <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                           </button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20 scroll-smooth scrollbar-thin scrollbar-thumb-slate-200">
                         {/* Chat Date Divider */}
                         <div className="flex justify-center">
                            <span className="text-[8px] font-black uppercase text-slate-300 bg-white border border-slate-100 px-3 py-1 rounded-full">Сегодня</span>
                         </div>

                         {directMessages
                           .filter(m => m.participants.includes(activeDirectChat.uid))
                           .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
                           .map((m, idx, arr) => {
                             const prevMsg = arr[idx-1];
                             const showAvatar = !prevMsg || prevMsg.senderId !== m.senderId;
                             const isOwn = m.senderId === user?.uid;

                             return (
                               <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${!showAvatar ? 'mt-1' : 'mt-6'}`}>
                                  {!isOwn && (
                                    <div className="w-8 shrink-0 flex flex-col justify-end pb-1 pr-2">
                                       {showAvatar && (
                                         activeDirectChat.avatarUrl ? (
                                           <img src={activeDirectChat.avatarUrl} className="w-6 h-6 rounded-full object-cover" alt="" referrerPolicy="no-referrer" />
                                         ) : (
                                           <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-polis-copper font-black">{activeDirectChat.displayName[0]}</div>
                                         )
                                       )}
                                    </div>
                                  )}
                                  <div className="max-w-[80%] flex flex-col items-end">
                                     <div className={`p-4 rounded-3xl text-[11px] font-medium leading-relaxed group relative transition-all shadow-sm ${isOwn ? 'bg-polis-green text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'}`}>
                                        <div className="mb-1">{m.text}</div>
                                        <div className={`text-[7px] font-bold flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity ${isOwn ? 'text-white' : 'text-slate-400'}`}>
                                           {m.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                           {isOwn && <Zap className="w-2 h-2" />}
                                        </div>
                                     </div>
                                  </div>
                               </div>
                             );
                           })}
                         {isGeneratingReply && (
                            <div className="flex justify-start mt-4">
                               <div className="w-8 shrink-0" />
                               <div className="bg-white border border-slate-100 p-3 rounded-2xl flex gap-1 items-center shadow-sm">
                                  <div className="w-1.5 h-1.5 bg-polis-copper rounded-full animate-bounce [animation-delay:-0.3s]" />
                                  <div className="w-1.5 h-1.5 bg-polis-copper rounded-full animate-bounce [animation-delay:-0.15s]" />
                                  <div className="w-1.5 h-1.5 bg-polis-copper rounded-full animate-bounce" />
                               </div>
                            </div>
                         )}
                         <div ref={dmEndRef} />
                      </div>

                      <div className="p-6 bg-white border-t border-slate-100 flex flex-col gap-4">
                         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                            {['Приветствую!', 'Как продвигается служба?', 'Есть вопросы по Полис-протоколу'].map(suggestion => (
                              <button 
                                key={suggestion}
                                onClick={() => setPrivateMessageInput(suggestion)}
                                className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-bold text-slate-500 hover:border-polis-copper hover:text-polis-copper transition-all whitespace-nowrap"
                              >
                                {suggestion}
                              </button>
                            ))}
                         </div>
                         <form onSubmit={handleSendDirectMessage} className="flex gap-3 items-center">
                            <button type="button" className="p-2 text-slate-300 hover:text-polis-copper transition-colors shrink-0">
                               <Paperclip className="w-5 h-5" />
                            </button>
                            <div className="flex-1 relative">
                               <input 
                                 type="text" 
                                 value={privateMessageInput}
                                 onChange={(e) => setPrivateMessageInput(e.target.value)}
                                 placeholder="Напишите сообщение..." 
                                 className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-6 py-4 transition-all focus:ring-2 focus:ring-polis-copper/20 focus:border-polis-copper outline-none text-xs"
                               />
                               <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                  <Smile className="w-4 h-4 text-slate-300 hover:text-polis-copper cursor-pointer" />
                               </div>
                            </div>
                            <button type="submit" disabled={!privateMessageInput.trim()} className="h-14 w-14 bg-polis-copper text-white rounded-full hover:opacity-90 transition-all shadow-lg shadow-polis-copper/20 flex items-center justify-center shrink-0 disabled:opacity-30 disabled:shadow-none active:scale-95">
                               <Send className="w-6 h-6" />
                            </button>
                         </form>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/50">
                       <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-xl mb-6 text-polis-copper">
                          <MessageSquare className="w-10 h-10 opacity-30" />
                       </div>
                       <h3 className="text-xl font-black uppercase text-polis-green italic tracking-tighter mb-2">Выберите собеседника</h3>
                       <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                          Все граждане и синтетические агенты Полиса отображены в левой колонке. Используйте реестр, чтобы найти новых контактов.
                       </p>
                    </div>
                  )}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Onboarding Flow */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
             <motion.div
               initial={{ opacity: 0, y: 50, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, scale: 1.05 }}
               className="bg-white w-full max-w-xl rounded-[4rem] shadow-2xl overflow-hidden border border-white/20 p-12 text-center"
             >
                <div className="flex justify-center mb-8">
                   {onboardingStep === 0 && <Compass className="w-20 h-20 text-polis-copper animate-pulse" />}
                   {onboardingStep === 1 && <User className="w-20 h-20 text-polis-green" />}
                   {onboardingStep === 2 && <Shield className="w-20 h-20 text-amber-500" />}
                   {onboardingStep === 3 && <Sparkles className="w-20 h-20 text-indigo-500" />}
                </div>

                <div className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-[0.5em]">
                   Шаг {onboardingStep + 1} из 4
                </div>
                
                <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-6 text-slate-900 leading-none">
                   {onboardingStep === 0 && "Добро пожаловать в Полис"}
                   {onboardingStep === 1 && "Ваша Идентичность"}
                   {onboardingStep === 2 && "Путь Меритократа"}
                   {onboardingStep === 3 && "Механика Действия"}
                </h2>

                <div className="text-slate-500 leading-relaxed mb-10 text-lg italic h-32 flex items-center justify-center">
                   {onboardingStep === 0 && "Полис — это не просто город, это живая меритократическая система. Здесь каждый голос имеет вес, а каждый вклад признается цифровым медиатором Арионом."}
                   {onboardingStep === 1 && (
                     <div className="space-y-4 w-full">
                        <p className="text-sm">Начнем с настройки вашего профиля. Как вас должны называть в реестре?</p>
                        <input 
                          type="text" 
                          placeholder="Имя в Полисе"
                          value={userData?.displayName || ""}
                          onChange={(e) => setUserData({...userData, displayName: e.target.value})}
                          className="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 text-center font-black text-xl focus:ring-2 focus:ring-polis-copper transition-all text-polis-copper"
                        />
                     </div>
                   )}
                   {onboardingStep === 2 && "Вы начинаете как Адепт. Выполняя поручения и участвуя в жизни Полиса, вы повышаете свой рейтинг и Вес (Weight) голоса."}
                   {onboardingStep === 3 && "Агора для дискуссий, Реестр для поиска связей, Венчурный Счет для создания больших проектов. Арион всегда готов направить вас."}
                </div>

                <div className="flex justify-center gap-4">
                   {onboardingStep > 0 && (
                     <button 
                       onClick={() => setOnboardingStep(prev => prev - 1)}
                       className="px-10 py-5 bg-slate-100 text-slate-400 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                     >
                        Назад
                     </button>
                   )}
                   
                   {onboardingStep < 3 ? (
                     <button 
                       onClick={() => setOnboardingStep(prev => prev + 1)}
                       disabled={onboardingStep === 1 && !userData?.displayName}
                       className="px-12 py-6 bg-polis-copper text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:shadow-xl active:scale-95 transition-all disabled:opacity-50"
                     >
                        Продолжить
                     </button>
                   ) : (
                     <button 
                       onClick={handleCompleteOnboarding}
                       className="px-12 py-6 bg-polis-green text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:shadow-xl active:scale-95 transition-all"
                     >
                        Приступить к Служению
                     </button>
                   )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
