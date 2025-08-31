"use strict";
import { renderHighScores } from '../renderHighScoresVrbs.js';
// 🔊 Función segura para cargar sonidos
function safeAudio(path) {
  const audio = new Audio(path);
  audio.addEventListener("error", () => {
    console.warn(`No se pudo cargar el audio: ${path}`);
  });
  return audio;
}
  // Protección contra clic derecho e inspección básica
  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("keydown", e => {
    if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i")) {
      e.preventDefault();
    }
  });
// Agrega estos dos objetos Audio al inicio de tu script
const correctSound = new Audio('verbos/correct.mp3');
const incorrectSound = new Audio('verbos/incorrect.mp3');

const verbs = [
  { spanish: 'Comer', english: 'Eat', img: 'verbos/eat.webp' },
  { spanish: 'Beber', english: 'Drink', img: 'verbos/beber.webp' },
  { spanish: 'Correr', english: 'Run', img: 'verbos/run.webp' },
  { spanish: 'Hablar', english: 'Speak', img: 'verbos/speak.webp' },
  { spanish: 'Recordar', english: 'Remember', img: 'verbos/recordar.webp' },
  { spanish: 'Dormir', english: 'Sleep', img: 'verbos/dormir.webp' },
  { spanish: 'Escuchar', english: 'Listen', img: 'verbos/escuchar.webp' },
  { spanish: 'Responder', english: 'Answer', img: 'verbos/responder.webp' },
  { spanish: 'Disculpar', english: 'Excuse', img: 'verbos/disculpar.webp' },
  { spanish: 'Llegar', english: 'Arrive', img: 'verbos/llegar.webp' },
  { spanish: 'Preguntar', english: 'Ask', img: 'verbos/preguntar.webp' },
  { spanish: 'Atacar', english: 'Attack', img: 'verbos/atacar.webp' },
  { spanish: 'Hornear', english: 'Bake', img: 'verbos/hornear.webp' },
  { spanish: 'Bañar', english: 'Bathe', img: 'verbos/bañar.webp' },
  { spanish: 'Comportarse', english: 'Behave', img: 'verbos/comportarse.webp' },
  { spanish: 'creer', english: 'Believe', img: 'verbos/creer.webp' },
  { spanish: 'Hervir', english: 'Boil', img: 'verbos/hervir.webp' },
  { spanish: 'Tomar_Prestado', english: 'Borrow', img: 'verbos/prestado.webp' },
  { spanish: 'Romper', english: 'Break', img: 'verbos/break.webp' },
  { spanish: 'Respirar', english: 'Breathe', img: 'verbos/respirar.webp' },
  { spanish: 'Construir', english: 'Build', img: 'verbos/construir.webp' },
  { spanish: 'Comprar', english: 'Buy', img: 'verbos/buy.webp' },
  { spanish: 'Llamar', english: 'Call', img: 'verbos/call.webp' },
  { spanish: 'Cuidar', english: 'Care', img: 'verbos/cuidar.webp' },
  { spanish: 'Llevar', english: 'Carry', img: 'verbos/llevar.webp' },
  { spanish: 'Atrapar', english: 'Catch', img: 'verbos/atrapar.webp' },
  { spanish: 'Celebrar', english: 'Celebrate', img: 'verbos/celebrar.webp' },
  { spanish: 'Cambiar', english: 'Change', img: 'verbos/cambiar.webp' },
  { spanish: 'Limpiar', english: 'Clean', img: 'verbos/limpiar.webp' },
  { spanish: 'Escalar', english: 'Climb', img: 'verbos/escalar.webp' },
  { spanish: 'Cerrar', english: 'Close', img: 'verbos/cerrar.webp' },
  { spanish: 'Recolectar', english: 'Collect', img: 'verbos/recolectar.webp' },
  { spanish: 'Venir', english: 'Come', img: 'verbos/venir.webp' },
  { spanish: 'Cocinar', english: 'Cook', img: 'verbos/cocinar.webp' },
  { spanish: 'Llorar', english: 'Cry', img: 'verbos/llorar.webp' },
  { spanish: 'Bailar', english: 'Dance', img: 'verbos/bailar.webp' },
  { spanish: 'Decidir', english: 'Decide', img: 'verbos/decidir.webp' },
  { spanish: 'Hacer', english: 'Do', img: 'verbos/hacer.webp' },
  { spanish: 'Soñar', english: 'Dream', img: 'verbos/soñar.webp' },
  { spanish: 'Conducir', english: 'Drive', img: 'verbos/conducir.webp' },
  { spanish: 'Alimentar', english: 'Feed', img: 'verbos/alimentar.webp' },
  { spanish: 'Sentir', english: 'Feel', img: 'verbos/sentir.webp' },
  { spanish: 'Pelear', english: 'Fight', img: 'verbos/pelea.webp' },
  { spanish: 'Encontrar', english: 'Find', img: 'verbos/encontrar.webp' },
  { spanish: 'Terminar', english: 'Finish', img: 'verbos/finish.webp' },
  { spanish: 'Volar', english: 'Fly', img: 'verbos/volar.webp' },
  { spanish: 'Caer', english: 'Fall', img: 'verbos/caer.webp' },
  { spanish: 'seguir', english: 'Follow', img: 'verbos/follow.webp' },
  { spanish: 'Perdonar', english: 'Forgive', img: 'verbos/Forgive.webp' },
  { spanish: 'Conseguir', english: 'Get', img: 'verbos/Get.webp' },
  { spanish: 'Dar', english: 'Give', img: 'verbos/dar.webp' },
  { spanish: 'Ir', english: 'Go', img: 'verbos/go.webp' },
  { spanish: 'Crecer', english: 'Grow', img: 'verbos/grow.webp' },
  { spanish: 'Odiar', english: 'Hate', img: 'verbos/hate.webp' },
  { spanish: 'Tener', english: 'Have', img: 'verbos/have.webp' },
  { spanish: 'Escuchar', english: 'Hear', img: 'verbos/hear.webp' },
  { spanish: 'Ayudar', english: 'Help', img: 'verbos/help.webp' },
  { spanish: 'Esconder', english: 'Hide', img: 'verbos/hide.webp' },
  { spanish: 'Invitar', english: 'Invite', img: 'verbos/invite.webp' },
  { spanish: 'Saltar', english: 'Jump', img: 'verbos/jump.webp' },
  { spanish: 'Mantener', english: 'Keep', img: 'verbos/mantener.webp' },
  { spanish: 'Besar', english: 'Kiss', img: 'verbos/kiss.webp' },
  { spanish: 'Saber_Conocer', english: 'Know', img: 'verbos/know.webp' },
  { spanish: 'Reir', english: 'Laugh', img: 'verbos/reir.webp' },
  { spanish: 'Aprender', english: 'Learn', img: 'verbos/learn.webp' },
  { spanish: 'Dejar', english: 'Leave', img: 'verbos/leave.webp' },
  { spanish: 'Escuchar', english: 'Listen', img: 'verbos/escuchar.webp' },
  { spanish: 'Vivir', english: 'Live', img: 'verbos/live.webp' },
  { spanish: 'Mirar', english: 'Look', img: 'verbos/look.webp' },
  { spanish: 'Amar', english: 'Love', img: 'verbos/love.webp' },
  { spanish: 'Hacer', english: 'Make', img: 'verbos/make.webp' },
  { spanish: 'Casarse', english: 'Marry', img: 'verbos/marry.webp' },
  { spanish: 'Conocer', english: 'Meet', img: 'verbos/meet.webp' },
  { spanish: 'Extrañar', english: 'Miss', img: 'verbos/miss.webp' },
  { spanish: 'Mover', english: 'Move', img: 'verbos/move.webp' },
  { spanish: 'Necesitar', english: 'Need', img: 'verbos/need.webp' },
  { spanish: 'Abrir', english: 'Open', img: 'verbos/abrir.webp' },
  { spanish: 'Necesitar', english: 'Need', img: 'verbos/need.webp' },
  { spanish: 'Dibujar', english: 'Paint', img: 'verbos/paint.webp' },
  { spanish: 'Jugar', english: 'Play', img: 'verbos/play.webp' },
  { spanish: 'Leer', english: 'Read', img: 'verbos/read.webp' },
  { spanish: 'Recordar', english: 'Remember', img: 'verbos/recordar.webp' },
  { spanish: 'Correr', english: 'Run', img: 'verbos/run.webp' },
  { spanish: 'Decir', english: 'Say', img: 'verbos/say.webp' },
  { spanish: 'Ver', english: 'See', img: 'verbos/see.webp' },
  { spanish: 'Vender', english: 'Sell', img: 'verbos/sell.webp' },
  { spanish: 'Enviar', english: 'Send', img: 'verbos/send.webp' },
  { spanish: 'Compartir', english: 'Share', img: 'verbos/share.webp' },
  { spanish: 'Mostrar', english: 'Show', img: 'verbos/show.webp' },
  { spanish: 'Cantar', english: 'Sing', img: 'verbos/sing.webp' },
  { spanish: 'Sentarse', english: 'Sit', img: 'verbos/sit.webp' },
  { spanish: 'Dormir', english: 'Sleep', img: 'verbos/dormir.webp' },
  { spanish: 'Hablar', english: 'Speak', img: 'verbos/speak.webp' },
  { spanish: 'Gastar', english: 'Spend', img: 'verbos/spend.webp' },
  { spanish: 'Pararse', english: 'Stand', img: 'verbos/stand.webp' },
  { spanish: 'Empezar', english: 'Start', img: 'verbos/start.webp' },
  { spanish: 'Quedarse', english: 'Stay', img: 'verbos/stay.webp' },
  { spanish: 'Estudiar', english: 'Study', img: 'verbos/study.webp' },
  { spanish: 'Nadar', english: 'Swim', img: 'verbos/swim.webp' },
  { spanish: 'Tomar', english: 'Take', img: 'verbos/take.webp' },
  { spanish: 'Hablar', english: 'Talk', img: 'verbos/talk.webp' },
  { spanish: 'Enseñar', english: 'Teach', img: 'verbos/teach.webp' },
  { spanish: 'Contar', english: 'Tell', img: 'verbos/tell.webp' },
  { spanish: 'Pensar', english: 'Think', img: 'verbos/think.webp' },
  { spanish: 'Viajar', english: 'Travel', img: 'verbos/travel.webp' },
  { spanish: 'Intentar', english: 'Try', img: 'verbos/try.webp' },
  { spanish: 'Entender', english: 'Understand', img: 'verbos/entender.webp' },
  { spanish: 'Usar', english: 'Use', img: 'verbos/use.webp' },
  { spanish: 'Esperar', english: 'Wait', img: 'verbos/wait.webp' },
  { spanish: 'Caminar', english: 'Walk', img: 'verbos/walk.webp' },
  { spanish: 'Querer', english: 'Want', img: 'verbos/want.webp' },
  { spanish: 'Mirar', english: 'Watch', img: 'verbos/watch.webp' },
  { spanish: 'Usar_ropa', english: 'Wear', img: 'verbos/wear.webp' },
  { spanish: 'Ganar', english: 'Win', img: 'verbos/win.webp' },
  { spanish: 'Trabajar', english: 'Work', img: 'verbos/work.webp' },
  { spanish: 'Escribir', english: 'Write', img: 'verbos/write.webp' },
  // ... finn de verbos
];

// Variables de juego
let score = 0;
let wrongCount = 0;
let timeLeft = 30;
let baseTimeLeft = 30;
let streakCount = 0;
let comboMultiplier = 1;
let timerInterval;
let allowSelection = true;
let lastCardTime = 0;
let lastVerb = null; // Para evitar mostrar el mismo verbo dos veces seguidas

// DOM
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');

const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const scoreEl = document.getElementById('score');
const wrongEl = document.getElementById('wrong');
const timerEl = document.getElementById('timer');

const cardImg = document.getElementById('card-img');
const cardWord = document.getElementById('card-word');
const optionsEl = document.getElementById('options');

const streakBonusEl = document.getElementById('streak-bonus');
const finalScoreEl = document.getElementById('final-score');
const finalWrongEl = document.getElementById('final-wrong');

const shareButtons = document.getElementById('share-buttons');
const leaderboard = document.getElementById('leaderboard');

const highscoresContainer = document.getElementById('highscores-container');
const specialMessage = document.getElementById('specialMessage');

// Eventos
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', resetGame);

// Reinicia variables sin recargar la página
function resetGame() {
  clearInterval(timerInterval);
  resetGameVariables();

  endScreen.classList.add('hidden');
  highscoresContainer.classList.add('hidden');
  specialMessage.style.opacity = '0';
  specialMessage.style.pointerEvents = 'none';

  gameScreen.classList.remove('hidden');
  timerInterval = setInterval(updateTimer, 1000);
  showNextCard();
}

// Reset de todas las variables
function resetGameVariables() {
  score = 0;
  wrongCount = 0;
  timeLeft = baseTimeLeft;
  streakCount = 0;
  comboMultiplier = 1;
  scoreEl.textContent = score;
  wrongEl.textContent = wrongCount;
  timerEl.textContent = timeLeft;
  lastVerb = null;
}

// Actualizar tiempo
function updateTimer() {
  timeLeft--;
  timerEl.textContent = timeLeft;
  timerEl.classList.toggle('timer-warning', timeLeft <= 10);
  if (timeLeft <= 0) endGame();
}

// Muestra una nueva carta sin repetir la anterior
function showNextCard() {
  allowSelection = true;
  cardImg.classList.remove('shrink-pop');
  cardImg.style.borderColor = 'transparent';

  let verb;
  do {
    verb = verbs[Math.floor(Math.random() * verbs.length)];
  } while (verb === lastVerb && verbs.length > 1);
  lastVerb = verb;

  const askInSpanish = Math.random() < 0.5;
  const correct = askInSpanish ? verb.english : verb.spanish;
  const pool = verbs
    .map(v => askInSpanish ? v.english : v.spanish)
    .filter(w => w !== correct);

  const choices = [correct];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    choices.push(pool.splice(idx, 1)[0]);
  }

  choices.sort(() => Math.random() - 0.5);
  cardImg.src = verb.img;
  cardWord.textContent = askInSpanish ? verb.spanish : verb.english;
  optionsEl.innerHTML = '';

  void cardImg.offsetWidth;
  cardImg.classList.add('bounce');

  choices.forEach(choice => {
    const btn = createOptionButton(choice, correct);
    optionsEl.appendChild(btn);
  });

  lastCardTime = Date.now();
}

// Crea un botón de opción con animación de letras
function createOptionButton(choice, correct) {
  const btn = document.createElement('div');
  btn.classList.add('option');
  btn.innerHTML = choice.split('').map(l => `<span>${l}</span>`).join('');
  btn.addEventListener('click', () => handleChoice(btn, choice === correct));
  return btn;
}

// Lógica para manejar selección de respuesta
function handleChoice(element, isCorrect) {
  if (!allowSelection) return;
  allowSelection = false;

  cardImg.classList.remove('bounce');
  cardImg.classList.add('shrink-pop');
  cardImg.style.borderColor = isCorrect ? 'green' : 'red';
  element.classList.add(isCorrect ? 'correct' : 'incorrect');

  (isCorrect ? correctSound : incorrectSound).play();
  if (!isCorrect) {
    cardImg.classList.add('shake');
    setTimeout(() => cardImg.classList.remove('shake'), 500);
  }

  clearInterval(timerInterval);

  if (isCorrect) {
    streakCount++;

    // 🔹 Multiplicador dinámico: a partir de racha > 4 empieza ×2, ×3, etc.
    comboMultiplier = streakCount > 4 ? (streakCount - 3) : 1;

    // 🔹 Suma puntos con multiplicador
    score += 1 * comboMultiplier;
    scoreEl.textContent = score;

    // 🔹 Tiempo extra opcional
    timeLeft += streakCount >= 3 ? 3 : 2;

    mostrarStreak();
    lanzarConfetti(20);
  } else {
    wrongCount++;
    streakCount = 0;
    comboMultiplier = 1;
    timeLeft = Math.max(timeLeft - 3, 5);
    wrongEl.textContent = wrongCount;
  }

  setTimeout(() => {
    timerInterval = setInterval(updateTimer, 1000);
    showNextCard();
  }, 600);
}

// Muestra animación de racha (streak)
function mostrarStreak() {
  if (comboMultiplier > 1) {
    streakBonusEl.textContent = `×${comboMultiplier}`;
    streakBonusEl.classList.remove('hidden');
    streakBonusEl.classList.add('streak-anim');
    streakBonusEl.addEventListener('animationend', () => {
      streakBonusEl.classList.add('hidden');
      streakBonusEl.classList.remove('streak-anim');
    }, { once: true });
  }
}

// Confetti limitado
function lanzarConfetti(cantidad) {
  const maxConfetti = 100;
  const actuales = document.querySelectorAll('.confetti').length;
  if (actuales > maxConfetti) return;

  const colors = ['#f00','#0f0','#ff0','#0ff','#f0f'];
  for (let i = 0; i < cantidad; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.setProperty('--confetti-color', colors[Math.floor(Math.random() * colors.length)]);
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    document.body.appendChild(confetti);
    confetti.addEventListener('animationend', () => confetti.remove());
  }
}

// Inicia el juego
function startGame() {
  resetGameVariables();
  startScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  timerInterval = setInterval(updateTimer, 1000);
  showNextCard();
}

function endGame() {
  clearInterval(timerInterval);

  // Ocultar juego, mostrar fin
  gameScreen.classList.add('hidden');
  endScreen.classList.remove('hidden');

  // Mostrar datos finales
  finalScoreEl.textContent = score;
  finalWrongEl.textContent = wrongCount;

  // Mostrar contenedor de ranking
  const highscoresContainer = document.getElementById('highscores-container');
  highscoresContainer.classList.remove('hidden');

  // Solo renderizar (ya guarda internamente)
  renderHighScores(score);
}