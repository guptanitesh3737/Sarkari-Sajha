import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || undefined);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const sheetsGoogleProvider = new GoogleAuthProvider();
sheetsGoogleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
sheetsGoogleProvider.addScope('https://www.googleapis.com/auth/drive.file');
sheetsGoogleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
