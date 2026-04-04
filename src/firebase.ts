import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  browserSessionPersistence,
  getAuth,
  GoogleAuthProvider,
  getRedirectResult,
  indexedDBLocalPersistence,
  initializeAuth,
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
const REDIRECT_PENDING_STORAGE_KEY = 'ascend:auth-redirect-pending';

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

function createAuth() {
  try {
    return initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    return getAuth(app);
  }
}

export const auth = createAuth();

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

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function markRedirectPending() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(REDIRECT_PENDING_STORAGE_KEY, '1');
}

function clearRedirectPending() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(REDIRECT_PENDING_STORAGE_KEY);
}

export function hasPendingRedirectSignIn() {
  if (!canUseStorage()) {
    return false;
  }

  return window.localStorage.getItem(REDIRECT_PENDING_STORAGE_KEY) === '1';
}

export async function signInWithGoogle() {
  if (shouldUseRedirectAuth()) {
    markRedirectPending();
    await signInWithRedirect(auth, googleProvider);
    return null;
  }

  return signInWithPopup(auth, googleProvider);
}

export async function completePendingRedirectSignIn() {
  if (!hasPendingRedirectSignIn()) {
    return null;
  }

  try {
    return await Promise.race([
      getRedirectResult(auth),
      new Promise<null>((resolve) => {
        window.setTimeout(() => resolve(null), 4000);
      }),
    ]);
  } finally {
    clearRedirectPending();
  }
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
