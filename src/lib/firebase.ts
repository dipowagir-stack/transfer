import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBuOcNk8ODeL7ZsdE2im0zNcQoo1GhWFm4",
  authDomain: "gen-lang-client-0871236748.firebaseapp.com",
  projectId: "gen-lang-client-0871236748",
  storageBucket: "gen-lang-client-0871236748.firebasestorage.app",
  messagingSenderId: "5903308790",
  appId: "1:5903308790:web:fa71654c0a0a56c14519d7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
