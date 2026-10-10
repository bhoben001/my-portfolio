import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { defaultContent, type SiteContent } from '../data/siteData';

/**
 * NOTE: These values are NOT secrets. A Firebase web config is public by design
 * (every visitor's browser needs it). Security comes from Firebase Authentication
 * + the Firestore rules in /firestore.rules, which only let the admin write.
 */
const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

/** Used only to decide whether to *show* admin buttons. Real enforcement is in Firestore rules. */
export const ADMIN_EMAIL = ((import.meta.env.VITE_ADMIN_EMAIL as string | undefined) || '')
  .trim()
  .toLowerCase();

export const firebaseEnabled = Boolean(cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId);

const app = firebaseEnabled ? initializeApp(cfg as Record<string, string>) : null;
export const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

export interface CvDoc {
  fileName: string;
  mimeType: string;
  dataBase64: string;
  size: number;
  uploadedAt: string;
}

export const CV_MAX_BYTES = 700_000; // Firestore documents are limited to 1 MiB (base64 adds ~33%)

function withTimeout<T>(p: Promise<T>, ms = 8000): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

export function friendlyError(e: unknown): string {
  const code = (e as { code?: string })?.code || '';
  if (code.includes('permission-denied')) return 'Permission denied. Sign in with the admin Google account.';
  if (code.includes('popup-closed')) return 'Sign-in window was closed.';
  if (code.includes('popup-blocked')) return 'Your browser blocked the sign-in popup. Allow popups and try again.';
  if (code.includes('unauthorized-domain'))
    return 'This domain is not authorised in Firebase (Authentication → Settings → Authorized domains).';
  if (code.includes('network')) return 'Network error. Check your connection.';
  return (e as Error)?.message || 'Something went wrong.';
}

/* ---------- Auth ---------- */
export async function loginWithGoogle() {
  if (!auth) throw new Error('Firebase is not configured.');
  await signInWithPopup(auth, new GoogleAuthProvider());
}

export async function logout() {
  if (auth) await signOut(auth);
}

/* ---------- Site content (public read, admin write) ---------- */
export async function fetchContent(): Promise<SiteContent | null> {
  if (!db) return null;
  try {
    const snap = await withTimeout(getDoc(doc(db, 'site', 'content')));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      projects: Array.isArray(d.projects) ? d.projects : defaultContent.projects,
      skillGroups: Array.isArray(d.skillGroups) ? d.skillGroups : defaultContent.skillGroups,
      experience: Array.isArray(d.experience) ? d.experience : defaultContent.experience,
    };
  } catch {
    return null; // site still works with the built-in defaults
  }
}

export async function saveContent(content: SiteContent) {
  if (!db) throw new Error('Firebase is not configured.');
  // JSON round-trip removes `undefined` values, which Firestore rejects.
  const clean = JSON.parse(JSON.stringify(content));
  await setDoc(doc(db, 'site', 'content'), { ...clean, updatedAt: new Date().toISOString() });
}

/* ---------- CV (stored as a small PDF inside Firestore) ---------- */
export async function fetchCv(): Promise<CvDoc | null> {
  if (!db) return null;
  try {
    const snap = await withTimeout(getDoc(doc(db, 'site', 'cv')));
    return snap.exists() ? (snap.data() as CvDoc) : null;
  } catch {
    return null;
  }
}

export async function saveCv(cv: CvDoc) {
  if (!db) throw new Error('Firebase is not configured.');
  await setDoc(doc(db, 'site', 'cv'), cv);
}

export async function deleteCv() {
  if (!db) throw new Error('Firebase is not configured.');
  await deleteDoc(doc(db, 'site', 'cv'));
}

/* ---------- helpers ---------- */
export function bufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

export function downloadCv(cv: CvDoc) {
  const bin = atob(cv.dataBase64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = (cv.fileName || 'CV.pdf').replace(/[^\w.\- ]/g, '_');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
