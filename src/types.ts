import { User as FirebaseUser } from "firebase/auth";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
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

export type CitizenRole = 'applicant' | 'participant' | 'actor' | 'architect' | 'master' | 'mediator' | 'admin';

export interface UserData {
  uid: string;
  displayName: string;
  email: string;
  role: CitizenRole;
  meritPoints: number;
  reputation: number;
  successfulDeeds: number;
  totalDeeds: number;
  onboardingCompleted?: boolean;
  photoURL?: string;
  badges?: string[];
  bio?: string;
}

export interface Petition {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  path: 'master' | 'philosopher' | 'patron';
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  moderatedBy?: string;
  moderatedAt?: any;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  complexity: 1 | 2 | 3 | 4 | 5;
  estimatedTime: string;
  importance: 'Low' | 'Medium' | 'High' | 'System-Critical';
  category: string;
  status: 'open' | 'claimed' | 'completed';
  claimedBy?: string;
  claimedAt?: any;
  completedAt?: any;
  creatorId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'system' | 'task' | 'merit' | 'role' | 'chat';
  read: boolean;
  createdAt: any;
}

export interface ChatMessage {
  role: 'user' | 'arion';
  text: string;
  suggestions?: { label: string, text: string }[];
  timestamp?: number;
}

export interface Document {
  id: string;
  title: string;
  desc: string;
  type: string;
  size: string;
  date: string;
  icon: any;
  url: string;
  content: string;
  versions: { v: string; date: string; note: string }[];
}

export interface ProjectProposal {
  id: string;
  title: string;
  slogan: string;
  objective: string;
  description: string;
  meritBudget: number;
  techStack: string[];
  positions: { title: string; requiredRole: string; description: string }[];
  creatorId: string;
  votes: number;
  status: 'voting' | 'approved' | 'rejected';
  createdAt: any;
}

export interface Profile {
  uid: string;
  displayName: string;
  role: string;
  isAI?: boolean;
  directive?: string;
  insights?: string;
  photoURL?: string;
}
