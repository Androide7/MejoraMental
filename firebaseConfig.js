// ✅ Solo una versión: desde CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  query,
  orderByChild,
  limitToLast,
  onValue,
  get,
  set,
  remove,
  child,
  off // ✅ AÑADIDO AQUÍ para evitar listeners duplicados
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

// ✅ Inicializa Firebase App y DB
const firebaseConfig = {
  apiKey: "AIzaSyBQcCGxrCgwlA8MM2vtZgVX28--Vuf7sFw",
  authDomain: "juegousuariosactivos.firebaseapp.com",
  databaseURL: "https://juegousuariosactivos-default-rtdb.firebaseio.com",
  projectId: "juegousuariosactivos",
  storageBucket: "juegousuariosactivos.firebasestorage.app",
  messagingSenderId: "896535330309",
  appId: "1:896535330309:web:9e96e6818c0288d93ae66c"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ————————————————————————————————
// 🔁 Reseteo semanal automático
// ————————————————————————————————
const RESET_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 días en ms
const LOCAL_KEY = 'lastFirebaseResetCheck';

const lastCheck = localStorage.getItem(LOCAL_KEY);
const now = Date.now();

if (!lastCheck || now - parseInt(lastCheck) > 12 * 60 * 60 * 1000) {
  localStorage.setItem(LOCAL_KEY, now);

  const metaRef = ref(db, 'meta/lastReset');
  get(metaRef).then((snapshot) => {
    const lastReset = snapshot.exists() ? snapshot.val() : 0;

    if (now - lastReset >= RESET_INTERVAL) {
      console.log('⏳ Reseteando scores semanalmente...');

      Promise.all([
        remove(ref(db, 'globalScores')),
        remove(ref(db, 'globalScores_colores')),
        remove(ref(db, 'globalScores_memoria')),
        remove(ref(db, 'globalScores_speed')),
        remove(ref(db, 'globalScores_verbs')),
        set(metaRef, now)
      ])
        .then(() => console.log('✅ Puntajes reseteados correctamente.'))
        .catch(err => console.error('❌ Error al resetear:', err));
    } else {
      console.log('⏱️ Aún no es hora de resetear.');
    }
  });
}

export {
  db, ref, push, query, orderByChild, limitToLast, onValue,
  get, set, remove, child, off // <- importante para evitar duplicación de listeners
};
