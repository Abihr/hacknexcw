import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";

import { auth } from "./firebase";


// Signup
export const signup = async (name, email, password) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;

  await updateProfile(user, {
    displayName: name,
  });

  return user;
};


// Login
export const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return userCredential.user;
};


// Logout
export const logout = async () => {
  await signOut(auth);
};


// Listen for authentication changes
export const listenToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};