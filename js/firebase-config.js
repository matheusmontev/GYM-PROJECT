/**
 * Configuração do Firebase SDK Modular (v9+)
 * Este arquivo centraliza a inicialização do app e dos serviços de Auth e Firestore.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Credenciais do projeto Firebase (obtidas no console do Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyB-EUEKc_7zzszou9qP83ic7DZV-1CBrZw",
  authDomain: "saas-treino-andre.firebaseapp.com",
  projectId: "saas-treino-andre",
  storageBucket: "saas-treino-andre.firebasestorage.app",
  messagingSenderId: "629928465846",
  appId: "1:629928465846:web:f78a04948113efed17dd17",
  measurementId: "G-CKG3HGYKL2"
};

// Inicializa a instância principal do Firebase
const app = initializeApp(firebaseConfig);

// Inicializa e expõe os serviços específicos
const auth = getAuth(app);
const db = getFirestore(app);

// Exporta as instâncias para serem usadas por outros módulos/arquivos
export { auth, db };
