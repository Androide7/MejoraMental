"use strict";

import { renderHighScores } from './renderHighScoresRfjM.js';

// Definición de las figuras y sus colores
const shapes = [
  { type: "triangulo", color: "red" },
  { type: "circulo", color: "blue" },
  { type: "cuadrado", color: "green" },
  { type: "rectangulo", color: "orange" },
  { type: "rombo", color: "purple" },
  { type: "pentagono", color: "teal" }
];

// Funciones para dibujar cada tipo de figura
const shapeDrawers = {
  triangulo: color => { const el = document.createElement("div"); el.style.width = "0"; el.style.height = "0"; el.style.borderLeft = "75px solid transparent"; el.style.borderRight = "75px solid transparent"; el.style.borderBottom = `150px solid ${color}`; return el; },
  circulo:   color => { const el = document.createElement("div"); el.style.width = el.style.height = "150px"; el.style.backgroundColor = color; el.style.borderRadius = "50%"; return el; },
  cuadrado:  color => { const el = document.createElement("div"); el.style.width = el.style.height = "150px"; el.style.backgroundColor = color; return el; },
  rectangulo:color => { const el = document.createElement("div"); el.style.width = "200px"; el.style.height = "100px"; el.style.backgroundColor = color; return el; },
  rombo:     color => { const el = document.createElement("div"); el.style.width = el.style.height = "150px"; el.style.backgroundColor = color; el.style.transform = "rotate(45deg)"; return el; },
  pentagono: color => { const el = document.createElement("div"); el.style.width = el.style.height = "150px"; el.style.backgroundColor = color; el.style.clipPath = "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)"; return el; }
};

// Variables de estado
let previousShape = null;
let currentShape  = null;
let score         = 0;
let incorrectCount= 0;
let timer         = 45;
let countdownInterval = null;
let inputCooldown = false; // ← Para prevenir doble entrada
let gameStarted = false; // 🔴 por defecto, el juego no ha comenzado
let isArrowPressed = false; // 🛑 Evita mantener presionado
let lastKey = null;         // 🛑 Evita presionar dos teclas a la vez
let keyPressed = {}; // 🔐 Para bloquear repeticiones
let streak = 0;
let multiplier = 1;
const basePoints = 1;

// Validación de puntuaciones para evitar manipulaciones
function isValidScore(score) {
  return Number.isInteger(score) && score >= 0 && score <= 10000;
}

// Referencias a elementos HTML
const startScreen       = document.getElementById("start-screen");
const startBtn          = document.getElementById("start-btn");
const gameContainer     = document.getElementById("game-container");
const prevShapeDiv      = document.getElementById("prev-shape");
const currShapeDiv      = document.getElementById("curr-shape");
const timerDisplay      = document.getElementById("timer");
const scoreDisplay      = document.getElementById("score");
const gameOverScreen    = document.getElementById("game-over");
const finalScoreDisplay = document.getElementById("final-score");
let finalIncorrectDisplay;
const restartBtn        = document.getElementById("restart-btn");
const arrowLeft         = document.getElementById("arrow-left");
const arrowRight        = document.getElementById("arrow-right");

// 🔊 Función segura para cargar sonidos
function safeAudio(path) {
  const audio = new Audio(path);
  audio.addEventListener("error", () => {
    console.warn(`No se pudo cargar el audio: ${path}`);
  });
  return audio;
}

// Elementos de audio
const startAudio     = new Audio('star.mp3');
const correctAudio   = new Audio('correct.mp3');
const incorrectAudio = new Audio('incorrect1.mp3');

// Dibuja una figura en un contenedor
function drawShape(container, shape) {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.classList.add("shape-wrapper");

  const el = shapeDrawers[shape.type]?.(shape.color);
  if (el) {
    el.classList.add("shape");
    wrapper.appendChild(el);
    container.appendChild(wrapper);
  }
}

// Efecto de giro de página
function animatePageTurn(container, callback) {
  container.classList.add("page-turn");
  setTimeout(() => { container.classList.remove("page-turn"); callback?.(); }, 300);
}

// Obtiene una forma aleatoria
function getRandomShape() { return shapes[Math.floor(Math.random() * shapes.length)]; }

// Prepara un nuevo par de figuras (60% de probabilidad de ser iguales)
function setupRound(sameProb = 0.6) {
  const isSame = Math.random() < sameProb;
  if (isSame) { const shape = getRandomShape(); previousShape = currentShape = shape; }
  else { previousShape = getRandomShape(); do { currentShape = getRandomShape(); } while (currentShape.type === previousShape.type); }
}

// Inicia una ronda nueva
function newRound() {
  if (timer <= 0) return;
  setupRound();
  animatePageTurn(prevShapeDiv, () => drawShape(prevShapeDiv, previousShape));
  animatePageTurn(currShapeDiv, () => drawShape(currShapeDiv, currentShape));
}

// Procesa la respuesta del jugador (true = mismo, false = distinto)
function processAnswer(isSame) {
  if (timer <= 0 || !previousShape || !currentShape) return;

  const correct = (previousShape.type === currentShape.type);

  if (isSame === correct) {
    correctAudio.currentTime = 0;
    correctAudio.play();

    // 🎯 Racha correcta
    streak++;

    // 🎯 Activar multiplicador si racha >= 3
    multiplier = (streak >= 3) ? streak - 1 : 1;

    // 🎯 Calcular puntos y sumar
    const gainedPoints = basePoints * multiplier;
    score += gainedPoints;
    scoreDisplay.textContent = `Puntos: ${score}`;

    // ✨ Animación especial si hay multiplicador
    if (multiplier > 1) {
      showFloatingPoints(gainedPoints);
      scoreDisplay.classList.remove('score-flash');
      void scoreDisplay.offsetWidth;
      scoreDisplay.classList.add('score-flash');
    }

  } else {
    incorrectAudio.currentTime = 0;
    incorrectAudio.play();
    incorrectCount++;

    // ❌ Reiniciar racha y multiplicador
    streak = 0;
    multiplier = 1;
  }

  newRound();
}

function showFloatingPoints(amount) {
  const floatEl = document.createElement('div');
  floatEl.className = 'floating-points';
  floatEl.textContent = `+${amount}`;

  const scoreRect = scoreDisplay.getBoundingClientRect();

  floatEl.style.left = `${scoreRect.left + scoreRect.width / 2}px`;
  floatEl.style.top = `${scoreRect.top + scoreRect.height}px`; // 👇 Aparece debajo del score
  floatEl.style.transform = 'translateX(-50%)'; // Centrado horizontal fijo

  document.body.appendChild(floatEl);

  floatEl.addEventListener('animationend', () => {
    floatEl.remove();
  });
}

// 🔐 Procesamiento con cooldown para evitar spam de entrada
function processAnswerSafe(isSame) {
  if (inputCooldown || timer <= 0) return;
  inputCooldown = true;
  processAnswer(isSame);
  setTimeout(() => inputCooldown = false, 300);
}

// Actualiza la pantalla del temporizador
function updateTimer() { timer--; timerDisplay.textContent = timer; if (timer <= 0) endGame(); }

// Finaliza el juego
function endGame() {
  gameStarted = false;
  isArrowPressed = false;
  keyPressed = {};
  lastKey = null;

  // 🔻 Oculta los cuadros al finalizar
  prevShapeDiv.style.visibility = 'hidden';
  currShapeDiv.style.visibility = 'hidden';

  clearInterval(countdownInterval);
  gameOverScreen.style.display = "flex";
  finalScoreDisplay.textContent = `Tu puntuación es: ${score}`;

  finalIncorrectDisplay = document.getElementById('final-incorrect');
  if (!finalIncorrectDisplay) {
    finalIncorrectDisplay = document.createElement('p');
    finalIncorrectDisplay.id = 'final-incorrect';
    gameOverScreen.insertBefore(finalIncorrectDisplay, restartBtn);
  }
  finalIncorrectDisplay.textContent = `Incorrectas: ${incorrectCount}`;

  const highscoresContainer = document.getElementById("highscores-container");
  highscoresContainer.classList.remove("hidden");
  highscoresContainer.style.display = "block";

  renderHighScores(score);

  // 🔻 Ocultar flechas y pregunta al finalizar el juego
  document.getElementById("arrow-container").classList.add("hidden");
  document.getElementById("arrow-question").classList.add("hidden");
}

// ⏳ Muestra conteo regresivo antes de iniciar el juego
function playStartCountdown(callback) {
  // 🔻 Oculta los cuadros antes del inicio
  prevShapeDiv.style.visibility = 'hidden';
  currShapeDiv.style.visibility = 'hidden';

  const overlay = document.createElement('div');
  overlay.id = 'countdown-overlay';
  Object.assign(overlay.style, {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '72px',
    color: '#fff',
    zIndex: 100
  });
  gameContainer.appendChild(overlay);

  let count = 3;
  overlay.textContent = count;

  const iv = setInterval(() => {
    count--;
    if (count > 0) {
      overlay.textContent = count;
    } else {
      clearInterval(iv);
      gameContainer.removeChild(overlay);
      startAudio.currentTime = 0;
      startAudio.play();

      // ✅ Muestra los cuadros cuando el juego empieza
      prevShapeDiv.style.visibility = 'visible';
      currShapeDiv.style.visibility = 'visible';

      // ✅ Muestra flechas y pregunta
      document.getElementById("arrow-container").classList.remove("hidden");
      document.getElementById("arrow-question").classList.remove("hidden");

      callback();
    }
  }, 1000);
}

// 🔄 Reset común
function resetGame() {
  score = 0;
  incorrectCount = 0;
  timer = 45;
  timerDisplay.textContent = timer;
  scoreDisplay.textContent = "Puntos: 0";
  if (finalIncorrectDisplay) finalIncorrectDisplay.textContent = '';
  gameOverScreen.style.display = "none";

  // 🔻 Oculta flechas antes de comenzar
  document.getElementById("arrow-container").classList.add("hidden");
  document.getElementById("arrow-question").classList.add("hidden");
}

// ▶️ Comienza juego con conteo
function startGame() {
  gameStarted = true;
  clearInterval(countdownInterval);
  resetGame();
  startScreen.style.display = "none";
  gameContainer.style.display = "block";
  gameContainer.style.position = "relative";
  playStartCountdown(() => {
    newRound();
    countdownInterval = setInterval(updateTimer, 1000);
  });
}

// 🔁 Reinicia juego y repite flujo
function restartGame() {
  gameStarted = false;
  isArrowPressed = false;
  keyPressed = {};
  lastKey = null;

  clearInterval(countdownInterval);
  resetGame();

  // 🔻 Oculta los cuadros antes del conteo
  prevShapeDiv.style.visibility = 'hidden';
  currShapeDiv.style.visibility = 'hidden';

  playStartCountdown(() => {
    newRound();
    countdownInterval = setInterval(updateTimer, 1000);
    gameStarted = true;
  });
}

// Eventos de teclado y clic con protección de doble entrada
document.addEventListener('keydown', (e) => {
  if (!gameStarted) return;

  const key = e.key;
  if ((key !== 'ArrowLeft' && key !== 'ArrowRight') || keyPressed[key]) return;

  if (lastKey && lastKey !== key) return; // evita presionar dos teclas a la vez

  keyPressed[key] = true;
  lastKey = key;

  if (key === 'ArrowLeft') {
    applyPressedEffect(arrowLeft);
    processAnswerSafe(false);
  } else if (key === 'ArrowRight') {
    applyPressedEffect(arrowRight);
    processAnswerSafe(true);
  }
});

document.addEventListener('keyup', (e) => {
  const key = e.key;
  if (key === 'ArrowLeft' || key === 'ArrowRight') {
    keyPressed[key] = false;
    lastKey = null;
  }
});

arrowLeft.addEventListener("click", () => processAnswerSafe(false));
arrowRight.addEventListener("click", () => processAnswerSafe(true));

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);

document.querySelectorAll('.arrow').forEach(arrow => {
  arrow.addEventListener('mousedown', () => {
    arrow.classList.add('pressed');
  });

  arrow.addEventListener('mouseup', () => {
    arrow.classList.remove('pressed');
  });

  // Para pantallas táctiles también
  arrow.addEventListener('touchstart', () => {
    arrow.classList.add('pressed');
  });

  arrow.addEventListener('touchend', () => {
    arrow.classList.remove('pressed');
  });
});

const applyPressedEffect = (element) => {
  if (!element) return;

  element.classList.add('pressed');
  setTimeout(() => {
    element.classList.remove('pressed');
  }, 200);
};

// ➤ Eventos de clic/táctil (bloquean mantener presionado)
[arrowLeft, arrowRight].forEach(arrow => {
  arrow.addEventListener('mousedown', () => {
    if (gameStarted && !isArrowPressed) {
      isArrowPressed = true;
      applyPressedEffect(arrow);
    }
  });

  arrow.addEventListener('touchstart', () => {
    if (gameStarted && !isArrowPressed) {
      isArrowPressed = true;
      applyPressedEffect(arrow);
    }
  });

  // Reset al soltar (evita mantenerlo)
  arrow.addEventListener('mouseup', () => {
    isArrowPressed = false;
  });

  arrow.addEventListener('touchend', () => {
    isArrowPressed = false;
  });
});

// ➤ Evento de teclado: sin repeticiones ni dos teclas a la vez
document.addEventListener('keydown', (e) => {
  if (!gameStarted) return;

  const key = e.key;
  if ((key !== 'ArrowLeft' && key !== 'ArrowRight') || keyPressed[key]) return;

  // Evitar presionar dos teclas diferentes a la vez
  if (lastKey && lastKey !== key) return;

  keyPressed[key] = true;
  lastKey = key;

  if (key === 'ArrowLeft') {
    applyPressedEffect(arrowLeft);
  } else if (key === 'ArrowRight') {
    applyPressedEffect(arrowRight);
  }
});

// ➤ Limpiar al soltar tecla
document.addEventListener('keyup', (e) => {
  const key = e.key;
  if (key === 'ArrowLeft' || key === 'ArrowRight') {
    keyPressed[key] = false;
    lastKey = null;
  }
});