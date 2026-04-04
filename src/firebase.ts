import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  type User,
} from 'firebase/auth';
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

function shouldUseRedirectAuth() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent || '';
  const webkitBridge = (window as Window & { webkit?: { messageHandlers?: unknown } }).webkit;
  const isIOS =
    /iPad|iPhone|iPod/.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const isEmbeddedWebView =
    /\bwv\b/i.test(userAgent) ||
    (/Android/i.test(userAgent) && /Version\/[\d.]+/i.test(userAgent)) ||
    (!!webkitBridge?.messageHandlers && !/Safari/i.test(userAgent));

  return isIOS || isStandalone || isEmbeddedWebView;
}

export async function signInWithGoogle() {
  if (shouldUseRedirectAuth()) {
    await signInWithRedirect(auth, googleProvider);
    return null;
  }

  return signInWithPopup(auth, googleProvider);
}

export async function completePendingRedirectSignIn() {
  return getRedirectResult(auth);
}

export {
  Timestamp,
  User,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onAuthStateChanged,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
};
