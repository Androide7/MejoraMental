"use strict";

import { renderHighScores } from './renderHighScoreClrs.js';

const colors = [
  "red", "green", "blue", "yellow", "purple", "gray",
  "orange", "brown", "pink", "cyan", "magenta", "black"
];

let score = 0;
let incorrect = 0;
let streak = 0;
let multiplier = 1;
let canAnswer = false;

let gameInterval;
const gameTime = 45;
let timeLeft = 0;
let gameStarted = false;
let rightTextColor = "";
let inputCooldown = false;
let alreadySavedOnline = false;


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

const correctSound = safeAudio("colors1.mp3");
const incorrectSound = safeAudio("incorrect1.mp3");

const buttonContainer = document.getElementById('button-container');
const startBtn = document.getElementById('start-btn27');
const gameContainer = document.getElementById('game-container');
const leftRect = document.getElementById('left-rect');
const rightRect = document.getElementById('right-rect');
const resultText = document.getElementById('result-text');
const timer = document.getElementById('timer1');
const scoreDisplay = document.getElementById('score');
const highScoresList = document.getElementById("highscores-list");
const streakContainer = document.getElementById('streak-container');
const streakBar = document.getElementById('streak-bar');
const streakText = document.getElementById('streak-text');

// Aplicar clases CSS
gameContainer.classList.add("game-container");
resultText.classList.add("result-text");

const title = document.createElement('h1');
title.textContent = "Comparación de colores";
title.classList.add('titulo-oculto');
gameContainer.prepend(title);

buttonContainer.classList.add("button-container");

const initialMessage = document.createElement('h2');
initialMessage.textContent = "Bienvenido al juego de comparación de colores. Usa las flechas izquierda y derecha para responder.";
initialMessage.classList.add("initial-message");
gameContainer.prepend(initialMessage);

const leftArrow = document.createElement('img');
leftArrow.src = "left.png";
leftArrow.classList.add("arrow-img", "arrow-left");

const rightArrow = document.createElement('img');
rightArrow.src = "right.png";
rightArrow.classList.add("arrow-img", "arrow-right");

gameContainer.appendChild(leftArrow);
gameContainer.appendChild(rightArrow);

const showButtons = () => buttonContainer.style.display = "flex";
const hideButtons = () => buttonContainer.style.display = "none";

const getRandomColor = (excludeColor = "") => {
  let color;
  do {
    color = colors[Math.floor(Math.random() * colors.length)];
  } while (color === excludeColor);
  return color;
};

const updateScoreDisplay = () => {
  scoreDisplay.textContent = `Puntaje: ${score} | Fallos: ${incorrect}`;
  updateStreakBar();
};

const updateGame = () => {
  const leftColorName = getRandomColor();
  const rightColorName = getRandomColor(leftColorName);
  rightTextColor = Math.random() < 0.5 ? leftColorName : getRandomColor(leftColorName);

  leftRect.textContent = leftColorName;
  rightRect.textContent = rightColorName;
  leftRect.style.color = "black";
  if (rightTextColor === "brown") {
    rightRect.style.color = "rgba(118, 43, 43, 0.88)"; // brown suave
  } else if (rightTextColor === "red") {
    rightRect.style.color = "rgba(235, 30, 30, 0.87)"; // red más suave
  } else if (rightTextColor === "magenta") {
    rightRect.style.color = "rgba(218, 0, 218, 0.85)"; // magenta suave
  } else if (rightTextColor === "orange") {
    rightRect.style.color = "rgba(250, 91, 0, 0.88)"; // orange suave
  } else {
    rightRect.style.color = rightTextColor;
  }
  
  resultText.style.display = "none";

  canAnswer = true;
  updateScoreDisplay();
};

function updateStreakBar() {
  streakContainer.classList.remove('hidden');

  const nextThreshold = 3;
  const progressCount = streak % nextThreshold;

  let percent;
  if (streak >= 3) {
    percent = (progressCount === 0 ? 1 : progressCount / nextThreshold) * 100;
  } else {
    percent = (streak / nextThreshold) * 100;
  }

  streakBar.style.width = `${percent}%`;
  streakText.textContent = `x${multiplier}`;

  streakBar.classList.remove('streak-x2', 'streak-x3', 'streak-x4', 'streak-x5');

  if (multiplier >= 5) {
    streakBar.classList.add('streak-x5');
  } else if (multiplier >= 4) {
    streakBar.classList.add('streak-x4');
  } else if (multiplier >= 3) {
    streakBar.classList.add('streak-x3');
  } else if (multiplier >= 2) {
    streakBar.classList.add('streak-x2');
  }
}

function processAnswerSafe(isSame) {
  if (inputCooldown || !canAnswer) return;
  inputCooldown = true;
  canAnswer = false;

  const leftColorName = leftRect.textContent.trim();
  const isCorrect = leftColorName === rightTextColor;
  let multiplierIncreased = false;

  if ((isCorrect && isSame) || (!isCorrect && !isSame)) {
    resultText.textContent = "✔️";
    resultText.style.color = "green";
    streak++;
    const prevMultiplier = multiplier;
    if (streak % 3 === 0) {
      multiplier++;
    }
    if (multiplier > prevMultiplier) {
      multiplierIncreased = true;
    }
    score += 1 * multiplier;
    correctSound.play();

    if (streak % 7 === 0) {
      timeLeft += 5;
      timer.textContent = `Tiempo: ${timeLeft}s`;
      showTimeBonusAnimation();
    }

  } else {
    resultText.textContent = "❌";
    resultText.style.color = "red";
    streak = 0;
    multiplier = 1;
    incorrect++;
    incorrectSound.play();
  }

  resultText.style.display = "block";
  updateScoreDisplay();

  if (multiplierIncreased) {
    streakText.classList.add('pulse');
    streakBar.classList.add('pulse');
    const removePulse = (e) => {
      e.target.classList.remove('pulse');
      e.target.removeEventListener('animationend', removePulse);
    };
    streakText.addEventListener('animationend', removePulse);
    streakBar.addEventListener('animationend', removePulse);
  }

  setTimeout(() => {
    if (gameStarted) {
      resultText.style.display = "none";
      resultText.textContent = "";
      updateGame();
    }
  }, 500);

  setTimeout(() => inputCooldown = false, 300);
}

function showTimeBonusAnimation() {
  const bonusEl = document.createElement('span');
  bonusEl.textContent = '+5s';
  bonusEl.classList.add('time-bonus');
  document.body.appendChild(bonusEl);
  timer.appendChild(bonusEl);
  bonusEl.addEventListener('animationend', () => {
    bonusEl.remove();
  });
}

const checkAnswer = (event) => {
  if (!gameStarted || inputCooldown || !canAnswer || event.repeat) return;

  if (event.key === "ArrowLeft") {
    animateArrow(leftArrow);
    processAnswerSafe(false);
  } else if (event.key === "ArrowRight") {
    animateArrow(rightArrow);
    processAnswerSafe(true);
  }
};
function animateArrow(arrowElement) {
  arrowElement.classList.add('pressed');
  setTimeout(() => {
    arrowElement.classList.remove('pressed');
  }, 150);
}


const startTimer = () => {
  clearInterval(gameInterval);
  timeLeft = gameTime;
  timer.textContent = `Tiempo: ${timeLeft}s`;
  timer.classList.add("timer-color");

  gameInterval = setInterval(() => {
    if (!gameStarted) return;

    timeLeft--;
    timer.textContent = `Tiempo: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(gameInterval);
      endGame();
    }
  }, 1000);
};

const startGame = () => {
  clearInterval(gameInterval);
  score = 0;
  incorrect = 0;
  streak = 0;
  multiplier = 1;
  gameStarted = true;

  streakContainer.classList.add('hidden');
  streakBar.style.width = '0%';
  streakText.textContent = '';

  gameContainer.style.display = "block";
  hideButtons();
  resultText.style.display = "none";
  leftRect.style.display = "inline-block";
  rightRect.style.display = "inline-block";
  scoreDisplay.style.display = "block";
  title.style.display = "none";
  timer.style.display = "block";
  initialMessage.style.display = "none";
  leftArrow.style.display = "block";
  rightArrow.style.display = "block";

  document.getElementById('highscores').style.display = "none";

  updateGame();
  startTimer();
};

const endGame = async () => {
  gameStarted = false;
  title.style.display = "block";
  resultText.style.color = "white";
  startBtn.textContent = "Reiniciar";
  leftRect.style.display = "none";
  rightRect.style.display = "none";
  timer.style.display = "none";
  showButtons();
  leftArrow.style.display = "none";
  rightArrow.style.display = "none";

  await renderHighScores(score); // ✅ Solo se llama una vez

  streakContainer.classList.add('hidden');
  streakBar.style.width = '0%';
  streakText.textContent = '';

  document.getElementById('highscores').style.display = "block";

  resultText.style.display = "none";
  resultText.textContent = "";
};

const restartGame = () => {
  score = 0;
  incorrect = 0;
  streak = 0;
  multiplier = 1;
  gameStarted = false;

  startGame();
  document.getElementById('highscores').style.display = "none";
};

startBtn.addEventListener('click', () => {
  gameStarted ? restartGame() : startGame();
});

document.addEventListener('keydown', checkAnswer);
leftArrow.addEventListener('click', () => processAnswerSafe(false));
rightArrow.addEventListener('click', () => processAnswerSafe(true));
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('highscores').style.display = "none";
});
