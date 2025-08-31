// saveHighScoreRflx.js
import { ref, push, query, orderByChild, limitToLast, onValue, off } from './firebaseConfig.js';
import { db } from './firebaseConfig.js';

const HIGH_SCORES_PATH = 'globalScores_speed'; // ⚡ Ruta específica para el juego de reflejo mental
const DISPLAY_TOP_N = 100; // 🔢 Número de puntajes a mostrar (ajustable)
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
    id, // 🔐 ID único por sesión
    timestamp: Date.now()
  }).then(() => {
    console.log('✅ Puntaje guardado en Firebase (speed)');
  }).catch((error) => {
    console.error('❌ Error al guardar (speed):', error);
  });
}

// ✅ Cargar top puntajes (score > 0) con listener limpio
export function loadHighScores(callback) {
  if (currentListenerRef) {
    off(currentListenerRef); // 🔁 Eliminar listener anterior
  }

  const newQuery = query(ref(db, HIGH_SCORES_PATH), orderByChild('score'), limitToLast(DISPLAY_TOP_N));
  currentListenerRef = newQuery;

  onValue(currentListenerRef, (snapshot) => {
    const data = snapshot.val();
    console.log('📥 Datos recibidos (speed):', data);
    if (!data) return callback([]);

    const scoresArray = Object.values(data)
      .filter(entry => entry.score > 0) // ✅ Ignorar puntajes inválidos
      .sort((a, b) => b.score - a.score)
      .slice(0, DISPLAY_TOP_N);

    callback(scoresArray);
  });
}
