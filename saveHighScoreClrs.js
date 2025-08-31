// saveHighScoreClrs.js
import { ref, push, query, orderByChild, limitToLast, onValue, off } from './firebaseConfig.js';
import { db } from './firebaseConfig.js';

const HIGH_SCORES_PATH = 'globalScores_colores'; // 🟡 Cambia este valor para cada juego
const DISPLAY_TOP_N = 100; // 🔢 Cantidad de puntajes a mostrar (ajustable)
let currentListenerRef = null;

// ✅ Guardar puntaje con validación y ID único por sesión
export function saveHighScore(name, score, id) {
  if (score <= 0) {
    console.warn('⚠️ Puntaje cero o negativo no será guardado:', score);
    return;
  }

  const scoresRef = ref(db, HIGH_SCORES_PATH);
  push(scoresRef, {
    name,
    score,
    id, // 🔐 ID único por sesión para validaciones de seguridad
    timestamp: Date.now()
  }).then(() => {
    console.log('✅ Puntaje guardado en Firebase (colores)');
  }).catch((error) => {
    console.error('❌ Error al guardar (colores):', error);
  });
}

// ✅ Cargar top puntajes (score > 0) con listener limpio
export function loadHighScores(callback) {
  if (currentListenerRef) {
    off(currentListenerRef); // 🔁 Eliminar listener previo
  }

  const newQuery = query(ref(db, HIGH_SCORES_PATH), orderByChild('score'), limitToLast(DISPLAY_TOP_N));
  currentListenerRef = newQuery;

  onValue(currentListenerRef, (snapshot) => {
    const data = snapshot.val();
    console.log('📥 Datos recibidos (colores):', data);
    if (!data) return callback([]);

    const scoresArray = Object.values(data)
      .filter(entry => entry.score > 0) // ✅ Ignorar ceros o negativos
      .sort((a, b) => b.score - a.score)
      .slice(0, DISPLAY_TOP_N);

    callback(scoresArray);
  });
}
