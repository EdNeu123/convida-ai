const firebaseConfig = {
  apiKey: "AIzaSyCc6dmPqo3sdKYePYAEhMnite_xQujLsBk",
  authDomain: "convida-ai-78d85.firebaseapp.com",
  projectId: "convida-ai-78d85",
  storageBucket: "convida-ai-78d85.firebasestorage.app",
  messagingSenderId: "935925545975",
  appId: "1:935925545975:web:b0d58df0b1c7a6e7888cf2",
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, collection, addDoc,
  onSnapshot, query, orderBy, serverTimestamp, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {
  db, auth, doc, getDoc, setDoc, collection, addDoc, onSnapshot, query,
  orderBy, serverTimestamp, deleteDoc, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  onAuthStateChanged, signOut
};
