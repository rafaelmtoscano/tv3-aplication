import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDnoKsiFO4DXTV4g8-J6hciiTuqUjadFtg",
  authDomain: "tv3-plataforma-comum.firebaseapp.com",
  projectId: "tv3-plataforma-comum",
  storageBucket: "tv3-plataforma-comum.firebasestorage.app",
  messagingSenderId: "1023358751181",
  appId: "1:1023358751181:web:60606cef64c822e669b484"
};

// Mantém o singleton existente. Adiciona export do app
// para outros módulos que precisem instanciar serviços do Firebase
// (ex: getAuth no DemoAuthGate).
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);