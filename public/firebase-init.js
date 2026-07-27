// ============================================================
// CONFIGURAÇÃO DO FIREBASE
// Pegue esses valores em: Console do Firebase > Configurações do
// projeto > Geral > "Seus apps" > app Web (ícone </>).
// ============================================================
const firebaseConfig = {
  apiKey: "COLE_AQUI",
  authDomain: "SEU-PROJETO.firebaseapp.com",
  projectId: "SEU-PROJETO",
  storageBucket: "SEU-PROJETO.appspot.com",
  messagingSenderId: "COLE_AQUI",
  appId: "COLE_AQUI",
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
