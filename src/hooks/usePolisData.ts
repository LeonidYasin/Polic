import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  limit, 
  where 
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase';
import { UserData, Petition, Task, Notification, Profile, ProjectProposal } from '../types';

export function usePolisData() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [allPetitions, setAllPetitions] = useState<Petition[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const [globalTasks, setGlobalTasks] = useState<Task[]>([]);
  const [allProjects, setAllProjects] = useState<ProjectProposal[]>([]);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setUserData(null);
        setLoading(false);
      }
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!user || !isFirebaseConfigured) return;

    const unsubUser = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        setUserData({ uid: snap.id, ...snap.data() } as UserData);
      }
      setLoading(false);
    });

    const unsubNotifs = onSnapshot(
      query(collection(db, 'notifications'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(20)),
      (snap) => {
        setUserNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
      }
    );

    return () => {
      unsubUser();
      unsubNotifs();
    };
  }, [user]);

  useEffect(() => {
    // Only fetch global data if user is management or if needed for dashboard
    if (!user || !isFirebaseConfigured) return;

    const unsubProfiles = onSnapshot(collection(db, 'profiles'), (snap) => {
      setAllProfiles(snap.docs.map(d => ({ uid: d.id, ...d.data() } as Profile)));
    });

    const unsubTasks = onSnapshot(
      query(collection(db, 'tasks'), where('status', '==', 'open'), orderBy('createdAt', 'desc')),
      (snap) => {
        setGlobalTasks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Task)));
      }
    );

    const unsubProjects = onSnapshot(
      query(collection(db, 'projects'), orderBy('createdAt', 'desc')),
      (snap) => {
        setAllProjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as ProjectProposal)));
      }
    );

    return () => {
      unsubProfiles();
      unsubTasks();
      unsubProjects();
    };
  }, [user]);

  // Management data
  useEffect(() => {
    const isAdmin = userData?.role === 'admin' || user?.email === 'leonidyasin@gmail.com' || user?.email === 'globalleonstube@gmail.com';
    if (!user || !isAdmin || !isFirebaseConfigured) return;

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setAllUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserData)));
    });

    const unsubPetitions = onSnapshot(query(collection(db, 'petitions'), orderBy('createdAt', 'desc')), (snap) => {
      setAllPetitions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Petition)));
    });

    return () => {
      unsubUsers();
      unsubPetitions();
    };
  }, [user, userData]);

  return {
    user,
    userData,
    loading,
    allUsers,
    allPetitions,
    allProfiles,
    userNotifications,
    globalTasks,
    allProjects,
    isFirebaseConfigured
  };
}
