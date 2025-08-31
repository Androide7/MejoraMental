// saveHighScoreFirebase.js
import { db, ref, push, query, orderByChild, limitToLast, onValue, off } from './firebaseConfig.js';

const HIGH_SCORES_PATH = 'globalScores'; // Cambia según el juego si es necesario
let currentListenerRef = null;
const DISPLAY_TOP_N = 100; // 👈 Puedes ajustar esto según necesidad

// ✅ Guardar puntaje en Firebase con ID único por sesión
export function saveHighScore(name, score, id) {
  if (score <= 0) {
    console.warn('⚠️ Puntaje cero o negativo no será guardado:', score);
    return;
  }

  const scoresRef = ref(db, HIGH_SCORES_PATH);
  push(scoresRef, {
    name,
    score,
    id,
    timestamp: Date.now()
  }).then(() => {
    console.log('✅ Puntaje guardado en Firebase');
  }).catch((error) => {
    console.error('❌ Error al guardar:', error);
  });
}

// ✅ Cargar los mejores puntajes (score > 0) y apagar listeners anteriores
export function loadHighScores(callback) {
  if (currentListenerRef) {
    off(currentListenerRef);
  }

  // ⚠️ Cargar más de los necesarios y filtrar luego
  const newQuery = query(ref(db, HIGH_SCORES_PATH), orderByChild('score'), limitToLast(DISPLAY_TOP_N));
  currentListenerRef = newQuery;

  onValue(currentListenerRef, (snapshot) => {
    const data = snapshot.val();
    console.log('📥 Datos recibidos desde Firebase:', data);
    if (!data) return callback([]);

    const scoresArray = Object.values(data)
      .filter(entry => entry.score > 0) // ✅ Ignorar ceros
      .sort((a, b) => b.score - a.score)
      .slice(0, DISPLAY_TOP_N); // 👈 Mostrar solo los top N válidos

    callback(scoresArray);
  });
}
