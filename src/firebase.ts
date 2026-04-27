import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const getFirebaseConfig = () => {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
};

const firebaseConfig = getFirebaseConfig();

export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.apiKey !== 'REDACTED-MOVE-TO-ENV-VARS');

let app: FirebaseApp | undefined;
let auth: Auth | any;
let db: Firestore | any;
let googleProvider: GoogleAuthProvider | any;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app, import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || undefined);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.warn("Firebase is not configured. Please set the environment variables.");
  // Provide dummy objects to prevent immediate crashes in components
  auth = { onAuthStateChanged: () => () => {}, currentUser: null };
  db = {};
  googleProvider = {};
}

export { app, auth, db, googleProvider };
