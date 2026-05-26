import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth-compat.js";

export const initAuth = (onUserChanged) => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userRef = db.collection('users').doc(user.uid);
      const doc = await userRef.get();
      if (!doc.exists) {
        await userRef.set({
          email: user.email,
          name: user.displayName || 'Creator',
          plan: 'free',
          creditsUsed: 0,
          totalGenerations: 0,
          createdAt: new Date()
        });
      }
    }
    onUserChanged(user);
  });
};

export const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const signupWithEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const loginWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);
export const logout = () => signOut(auth);
