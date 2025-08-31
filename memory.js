"use strict";
import { renderHighScores } from './renderHighScoresMmr.js';

document.addEventListener("DOMContentLoaded", () => {
  // Prevención básica
  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("keydown", e => {
    if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i")) {
      e.preventDefault();
    }
  });

  function safeAudio(path) {
    const audio = new Audio(path);
    audio.addEventListener("error", () => {
      console.warn(`No se pudo cargar el audio: ${path}`);
    });
    return audio;
  }

  const correctSound = safeAudio('carta.mp3');
  const incorrectSound = safeAudio('ngativo.mp3');
  const completeSound = safeAudio('victory.mp3');

  const startButton = document.getElementById("startGame");
  const gameBoard = document.getElementById("gameBoard");
  const container = document.querySelector(".intro");
  const stats = document.getElementById("stats");
  const errorsDisplay = document.getElementById("errors");
  const pointsDisplay = document.getElementById("points");
  const timerDisplay = document.getElementById("timer");

  let repeatLevelCount = 0;
  let gridSize = 2;
  let highlightedTiles = [];
  let errors = 0;
  const maxErrors = 5;
  const maxGridSize = 8;
  let timeLeft = 45;
  let gameTimer;
  let points = 0;
  let isGameRunning = false;
  let streakCount = 0;
  let multiplier = 1;

  startButton.addEventListener("click", startGame);

  function startGame() {
    if (isGameRunning) return;
    isGameRunning = true;

    errors = 0;
    gridSize = 2;
    timeLeft = 45;
    points = 0;
    streakCount = 0;
    multiplier = 1;
    hideMultiplier();

    updateStats();
    startButton.classList.add("hidden");
    container.classList.add("hidden");
    stats.classList.remove("hidden");
    gameBoard.classList.remove("hidden");

    errorsDisplay.style.display = "block";
    pointsDisplay.style.display = "block";

    document.getElementById("highscores-container").classList.add("hidden");
    document.getElementById("specialMessage").classList.add("hidden");
    document.getElementById("stats").style.display = "flex";

    startTimer();
    generateGrid();
  }

  function startTimer() {
    clearInterval(gameTimer);
    timerDisplay.classList.remove("hidden");
    gameTimer = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = `Tiempo restante: ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(gameTimer);
        endGame();
      }
    }, 1000);
  }

  function setTileListeners(on) {
    document.querySelectorAll(".tile").forEach(tile => {
      if (on) tile.addEventListener("click", checkSelection);
      else tile.removeEventListener("click", checkSelection);
    });
  }

  function generateGrid() {
    if (gridSize > maxGridSize) {
      endGame();
      return;
    }

    gameBoard.innerHTML = "";
    gameBoard.style.display = "grid";
    gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 60px)`;
    gameBoard.style.gridTemplateRows = `repeat(${gridSize}, 60px)`;
    gameBoard.style.justifyContent = "center";
    gameBoard.style.alignItems = "center";
    gameBoard.style.margin = "auto";
    highlightedTiles = [];

    setTileListeners(false);

    let totalTiles = gridSize * gridSize;
    for (let i = 0; i < totalTiles; i++) {
      let tile = document.createElement("div");
      tile.classList.add("tile");
      tile.dataset.index = i;
      gameBoard.appendChild(tile);
    }

    highlightRandomTiles();
  }

  function highlightRandomTiles() {
    let tiles = document.querySelectorAll(".tile");
    let count = Math.floor(gridSize * gridSize * 0.3);

    while (highlightedTiles.length < count) {
      let randomIndex = Math.floor(Math.random() * tiles.length);
      if (!highlightedTiles.includes(randomIndex)) {
        highlightedTiles.push(randomIndex);
        tiles[randomIndex].classList.add("highlighted");
      }
    }

    setTimeout(() => {
      tiles.forEach(t => t.classList.remove("highlighted"));
      setTileListeners(true);
    }, 2000);
  }

  function checkSelection(event) {
    let tile = event.target;
    if (tile.classList.contains("correct") || tile.classList.contains("incorrect")) return;

    let index = parseInt(tile.dataset.index);

    if (highlightedTiles.includes(index)) {
      tile.classList.add("correct");
      tile.innerHTML = "✓";
      correctSound.play();
      highlightedTiles = highlightedTiles.filter(i => i !== index);

      streakCount++;
      multiplier = Math.floor(streakCount / 5) + 1;
      points += multiplier;

      if (streakCount >= 5) {
        showMultiplier(multiplier);
      }
    } else {
      tile.classList.add("incorrect");
      tile.innerHTML = "✗";
      incorrectSound.play();
      errors++;

      streakCount = 0;
      multiplier = 1;
      hideMultiplier();
    }

    updateStats();

    if (errors >= maxErrors) {
      endGame();
      return;
    }

    if (highlightedTiles.length === 0) {
      setTileListeners(false);
      completeSound.play();
      timeLeft += 5;
      updateStats();

      setTimeout(() => {
        if (gridSize >= 4 && gridSize <= 8) {
          repeatLevelCount++;
          if (repeatLevelCount < 3) {
            generateGrid();
            return;
          }
          repeatLevelCount = 0;
        }

        gridSize++;
        updateStats();
        generateGrid();
      }, 1000);
    }
  }

  function updateStats() {
    errorsDisplay.textContent = `Fichas restantes: ${maxErrors - errors}`;
    pointsDisplay.textContent = `Puntos: ${points}`;
    timerDisplay.textContent = `Tiempo restante: ${timeLeft}s`;
  }

  function endGame() {
    clearInterval(gameTimer);
    gameBoard.innerHTML = "";
    stats.classList.add("hidden");
    timerDisplay.classList.add("hidden");
    isGameRunning = false;

    errorsDisplay.style.display = "none";
    pointsDisplay.style.display = "none";
    hideMultiplier();

    const highscoresContainer = document.getElementById("highscores-container");
    highscoresContainer.classList.remove("hidden");
    highscoresContainer.style.display = "block";

    renderHighScores(points);

    const endMessage = document.createElement("div");
    endMessage.classList.add("end-message");
    endMessage.innerHTML = `
      <h2>Juego Finalizado</h2>
      <p>Puntos obtenidos: <strong>${points}</strong></p>
    `;

    const restartButton = document.createElement("button");
    restartButton.textContent = "Reiniciar";
    restartButton.addEventListener("click", () => {
      gridSize = 2;
      errors = 0;
      points = 0;
      timeLeft = 45;
      streakCount = 0;
      multiplier = 1;
      hideMultiplier();
      repeatLevelCount = 0;
      endMessage.remove();
      highscoresContainer.classList.add("hidden");
      highscoresContainer.style.display = "none";
      startGame();
    });

    endMessage.appendChild(restartButton);
    gameBoard.appendChild(endMessage);
  }

  // 🔥 MULTIPLICADOR VISUAL 🔥
  function showMultiplier(multiplierValue) {
    const existing = document.querySelector(".multiplier-fly");
    if (existing) existing.remove(); // Evita duplicados
  
    const multiplierEl = document.createElement("div");
    multiplierEl.className = "multiplier-fly";
    multiplierEl.textContent = `x${multiplierValue}`;
    gameBoard.appendChild(multiplierEl);
  
    // Eliminar después de la animación
    setTimeout(() => {
      multiplierEl.remove();
    }, 1000);
  }
  

  function hideMultiplier() {
    const el = document.querySelector(".multiplier-fly");
    if (el) el.remove();
  }
  
});
