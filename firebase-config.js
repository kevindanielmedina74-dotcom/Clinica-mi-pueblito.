// ============================================================
//  Clínica Mi Pueblito — firebase-config.js
//  Configuración Firebase + Firestore (compat mode)
// ============================================================

const firebaseConfig = {
  apiKey:            "AIzaSyDH6TBpxr4mJOgla_sI890xA9GokSiry6Q",
  authDomain:        "clinica-mi-pueblito-1a419.firebaseapp.com",
  projectId:         "clinica-mi-pueblito-1a419",
  storageBucket:     "clinica-mi-pueblito-1a419.firebasestorage.app",
  messagingSenderId: "607054922417",
  appId:             "1:607054922417:web:2e128e18336152f9ea1890",
  measurementId:     "G-SRJ5TR8CRY"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Exportar Firestore para usar en script.js
const db = firebase.firestore();
