// ============================================================
// CONFIGURAÇÃO DO FIREBASE
// Pegue esses valores em: Console do Firebase > Configurações do
// projeto > Geral > "Seus apps" > app Web (ícone </>).
// ============================================================
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
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Documento único com os dados do convite (link genérico, um evento só).
const INVITE_DOC = doc(db, "invites", "main");
const RSVP_COL = collection(db, "invites", "main", "rsvps");

export {
  db, auth, doc, getDoc, setDoc, collection, addDoc, onSnapshot, query,
  orderBy, serverTimestamp, deleteDoc, signInWithEmailAndPassword,
  onAuthStateChanged, signOut, INVITE_DOC, RSVP_COL,
};
