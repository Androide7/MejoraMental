"use strict";
import { renderHighScores } from './renderHighScores.js';

(() => {
  document.addEventListener("DOMContentLoaded", () => {
    // Si la pestaña no está visible, no inicializamos
    if (document.visibilityState !== "visible") return;

    // ——————————————————————————————————————————————
    // 1) Referencias a elementos del DOM
    // ——————————————————————————————————————————————
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const startButton = document.getElementById("startButton");
    const answerInput = document.getElementById("answerInput");
    const endMessageDiv = document.getElementById("endMessage");
    const finalMessage = document.getElementById("finalMessage");
    const startMessage = document.getElementById("startMessage");
    const hsContainer = document.getElementById("highScoresContainer");

    if (hsContainer) hsContainer.style.display = 'none';

    canvas.width = 700;
    canvas.height = 700;

    // Limitar longitud y desactivar autofill adicionalmente
    answerInput.setAttribute('maxlength', '4');
    answerInput.setAttribute('autocomplete', 'off');
    answerInput.setAttribute('autocorrect', 'off');
    answerInput.setAttribute('autocapitalize', 'off');
    answerInput.setAttribute('spellcheck', 'false');

    // ** NUEVO: forzar teclado numérico en móvil **
    answerInput.setAttribute('type', 'tel');
    answerInput.setAttribute('inputmode', 'numeric');
    answerInput.setAttribute('pattern', '[0-9]*');

    // Cada vez que el usuario recibe foco, limpiamos el campo
    answerInput.addEventListener('focus', () => {
      answerInput.value = '';
    });

    // También lo limpiamos al perder foco (opcional)
    answerInput.addEventListener('blur', () => {
      answerInput.value = '';
    });

    // ——————————————————————————————————————————————
    //  2) Variables de estado principales
    // ——————————————————————————————————————————————
    let raindrops = [];
    let speed = 1.5;
    let score = 0;
    let missed = 0;
    let totalWrong = 0;
    let gameRunning = false;
    let dropInterval = 0;
    let lastTime = 0;
    let maxDrops = 3;
    let isFrozen = false;
    let gameStartTime = 0; // MS de cuando arrancó la partida
    let positiveStreakAfter2Min = 0;
    let timeTrialPending = false;
    let timeTrialPendingStart = 0;
    let inTimeTrial = false;
    let timeTrialStart = 0;
    const TIME_TRIAL_DURATION = 20_000; // 20 s
    let alreadySavedOnline = false;

    const DROP_RADIUS = 40;
    const BASE_INTERVAL = 2390;
    const MAX_MISSED = 5;
    const SPECIAL_PROB = 0.06;
    const DIVISION_RATIO = 0.2;
    const shouldUseDivision = () => Math.random() <= DIVISION_RATIO;
    const streakAnimations = [];

    // ——————————————————————————————————————————————
    //  3) Cambio de estilo de gotas cada 30 s
    // ——————————————————————————————————————————————
    const styles = ['default', 'flame', 'ice'];
    // ——————————————————————————————————————————————
    //  4) Racha y dificultad adaptativa
    // ——————————————————————————————————————————————
    let streak = 0;
    let consecutiveHits = 0; // Nuevo: solo cuenta aciertos seguidos
    let hitTimes = [];
    let missTimes = [];
    let lastAdaptiveCheck = performance.now();
    let lastAnswerTime = 0;
    let responseTimes = [];
    let adaptiveStart = null; // ← se setea al iniciar el juego
    let adaptiveEnd = null;
    let adaptiveEnabled = true;

    // ——————————————————————————————————————————————
    //  6) Carga segura de audio
    // ——————————————————————————————————————————————
    const safeAudio = (path) => {
      const audio = new Audio(path);
      audio.addEventListener("error", () => {
        console.warn(`No se pudo cargar el audio: ${path}`);
      });
      return audio;
    };
    const correctSound = safeAudio("gota.mp3");
    // ——————————————————————————————————————————————
    //  8) Funciones auxiliares
    // ——————————————————————————————————————————————
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const calc = (a, b, op) => {
      switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return Math.floor(a / b);
        default: return 0;
      }
    };

    const generateOperation = () => {
      const now = performance.now();
      const elapsedSec = (now - gameStartTime) / 1000;

      let a, b, op, res;

      // ————————————————————————————————
      // 1) Rango “básico”: operandos 1 dígito + 1 dígito
      // ————————————————————————————————
      const basicRange = () => {
        do {
          a = rand(1, 10);
          b = rand(1, 10);
          op = ["+", "-", "*", "/"][rand(0, 3)];

          if (op === "/") {
            const twoDigitChance = Math.random();

            if (twoDigitChance < 0.3) {
              // 30%: dividendo de dos cifras, divisor de un dígito (no 1)
              b = rand(2, 9);           // divisor: 1 dígito, diferente de 1
              const mult = rand(2, 9);  // multiplicador
              a = b * mult;             // dividendo de dos cifras
            } else {
              // División normal (entre números de un dígito, sin dividir entre 1)
              a = rand(2, 10);
              b = rand(2, 10);
              b = Math.min(b, a);
              while (a % b !== 0 || b === 1) {
                a = rand(2, 10);
                b = Math.min(rand(2, 10), a);
              }
            }
          }

          res = calc(a, b, op); // Cálculo normal: a / b

        } while (
          res < 0 ||
          !Number.isInteger(res) ||
          (op === "/" && !shouldUseDivision())
        );

      };

      // ————————————————————————————————
      // 2) Rango “avanzado”: uno de 2 dígitos + uno de 1 dígito,
      //    pero SOLO suma y resta
      // ————————————————————————————————
      const advancedRange = () => {
        do {
          const twoDigit = rand(10, 99);
          const oneDigit = rand(1, 9);

          // Decidir aleatorio quién es a y quién es b
          if (Math.random() < 0.2) {
            a = twoDigit;
            b = oneDigit;
          } else {
            a = oneDigit;
            b = twoDigit;
          }

          // Solo operadores + ó -
          op = ["+", "-"][rand(0, 1)];
          res = calc(a, b, op);
        } while (
          res < 0 ||
          !Number.isInteger(res)
        );
      };

      // ————————————————————————————————
      // 3) Lógica de selección según el tiempo transcurrido
      // ————————————————————————————————
      if (elapsedSec < 60) {
        // Primer minuto: siempre básico
        basicRange();
      } else {
        // Después de 1 min: 50% básico, 50% avanzado
        if (Math.random() < 0.8) {
          basicRange();
        } else {
          advancedRange();
        }
      }

      return { expr: `${a} ${op} ${b}`, res };
    };

    // ——————————————————————————————————————————————
    //  9) Crear una nueva gota
    // ——————————————————————————————————————————————
    const createDrop = () => {
      if (!gameRunning) return; // ⬅️ No crear gotas si el juego terminó
      if (raindrops.length >= maxDrops) return;
    
      const { expr, res } = generateOperation();
    
      // ✅ Ajustar posición horizontal según escala del canvas
      const x = rand(DROP_RADIUS * canvasScale, gameCanvas.width - DROP_RADIUS * canvasScale);
    
      // Inicial en y=0
      const y = 0;
    
      const now = performance.now();
    
      // Limitar gotas especiales si estás en contrarreloj o si han pasado más de 3:30 min
      const allowSpecial = !inTimeTrial && (now - gameStartTime < 210000);
      const isSpecial = allowSpecial && Math.random() < SPECIAL_PROB;
    
      raindrops.push({
        x,
        y,
        expr,
        res,
        special: isSpecial,
        createdAt: now
      });
    
      // Recalcular dropInterval con variación aleatoria
      dropInterval = (BASE_INTERVAL / speed) * (0.8 + Math.random() * 0.4);
    };
    

    // ——————————————————————————————————————————————
    // 10) Actualizar posición de gotas
    // ——————————————————————————————————————————————
// 🔹 Ajustar velocidad de caída según tamaño del canvas
const updateDrops = () => {
  if (isFrozen || !gameRunning) return;

  const scale = canvasScale; 
  const adjustedSpeed = speed * scale; // 👈 velocidad proporcional al tamaño del canvas

  raindrops = raindrops.filter(drop => {
    drop.y += adjustedSpeed; // ✅ ya no será tan rápido en pantallas pequeñas

    // Si la gota llega al fondo del canvas
    if (drop.y > canvas.height - DROP_RADIUS * scale) {
      if (!inTimeTrial) {
        missed++;
        totalWrong++;
        consecutiveHits = 0;
        streak = 0;
        positiveStreakAfter2Min = 0;
        checkWarning();

        if (missed > MAX_MISSED) {
          endGame();
          return false;
        }
      }
      return false; // eliminar gota
    }

    return true; // sigue en pantalla
  });
};


    // ——————————————————————————————————————————————
    // 11) Dibujar una gota individual según estilo actual
    // ——————————————————————————————————————————————
    const drawDrop = ({ x, y, expr, special }) => {
      const style = styles[currentStyleIndex];
    
      // Escalar radio según canvasScale
      const radius = DROP_RADIUS * canvasScale;
    
      const grad = ctx.createRadialGradient(x, y, 1, x, y, radius);
    
      if (special) {
        grad.addColorStop(0, "rgba(165,165,215,0.9)");
        grad.addColorStop(1, "rgba(150,0,150,0.8)");
        ctx.shadowBlur = 1;
        ctx.shadowColor = "rgba(50, 40, 78, 0.8)";
        ctx.strokeStyle = "rgba(255,215,0,0.9)";
      } else if (style === 'flame') {
        grad.addColorStop(0, "rgba(255,100,0,0.6)");
        grad.addColorStop(1, "rgba(180,0,0,0.7)");
        ctx.strokeStyle = "rgba(235,235,235,0.7)";
      } else if (style === 'ice') {
        grad.addColorStop(0, "rgba(0, 100, 80, 0.7)");
        grad.addColorStop(1, "rgba(0, 60, 40, 0.8)");
        ctx.strokeStyle = "rgba(200,255,200,0.7)";
      } else {
        grad.addColorStop(1, "rgba(0,160,220,0.9)");
        ctx.strokeStyle = "rgba(235,235,235,0.7)";
      }
    
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3 * canvasScale; // Ajustar grosor del borde
      ctx.stroke();
    
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "white";
      ctx.font = `${25 * canvasScale}px 'Comic Sans MS'`; // Texto más grande en pantallas pequeñas
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(expr, x, y);
    };
    
    
    // ——————————————————————————————————————————————
    // 12) Dibujar todas las gotas + HUD + animaciones de racha
    // ——————————————————————————————————————————————
// 🌟 Variables globales
const bgCanvas = document.getElementById('bgCanvas');
const gameCanvas = document.getElementById('gameCanvas');
let canvasScale = 1; // Escala relativa al tamaño base 700

// 📐 Ajustar canvas al tamaño del contenedor
function resizeCanvases() {
  const container = document.getElementById('gameContainer');
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Fondo
  bgCanvas.width = width;
  bgCanvas.height = height;

  // Juego
  gameCanvas.width = width;
  gameCanvas.height = height;

  // Escala relativa al tamaño base 700
  canvasScale = width / 700;
}

// Ajustar al cargar y al cambiar tamaño de ventana
window.addEventListener('resize', resizeCanvases);
resizeCanvases();

// 🌧️ Función drawDrops escalada
const drawDrops = () => {
  const scale = canvasScale; // Escala calculada en resizeCanvases

  // 🧹 Limpiar canvas
  ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

  // 💧 Dibujar cada gota (ya escala en drawDrop)
  raindrops.forEach(drawDrop);

  // 📊 HUD de puntuación y racha
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const lineHeight = 30 * scale; // Separación proporcional
  ctx.font = `${20 * scale}px 'Comic Sans MS'`;

  ctx.fillText(`Puntuación: ${score}`, 20 * scale, 20 * scale);

  if (consecutiveHits > 3) {
    const multiplier = streak + 1;
    ctx.fillText(`Racha: x${multiplier}`, 20 * scale, 20 * scale + lineHeight);
  }

  if (!inTimeTrial) {
    ctx.fillText(`Errores: ${missed} / ${MAX_MISSED}`, 20 * scale, 20 * scale + lineHeight * 2);
  }

  // ⏱️ Conteo regresivo
  if (inTimeTrial) {
    const remainingMs = TIME_TRIAL_DURATION - (performance.now() - timeTrialStart);
    const remainingS = Math.max(0, Math.ceil(remainingMs / 1000));
    ctx.save();
    ctx.fillStyle = "red";
    ctx.font = `${34 * scale}px 'Comic Sans MS'`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`Tiempo: ${remainingS}s`, bgCanvas.width / 2, 20 * scale);
    ctx.restore();
  }

  // 🌟 Animaciones de racha
  const toRemove = [];
  streakAnimations.forEach((anim, i) => {
    anim.t += 0.02;
    if (anim.t >= 1) {
      toRemove.push(i);
      return;
    }
    const x = anim.x0 + (anim.x1 - anim.x0) * anim.t;
    const y = anim.y0 + (anim.y1 - anim.y0) * anim.t;
    const alpha = 1 - anim.t;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `${28 * scale}px 'Comic Sans MS'`; // Escala animación
    ctx.fillStyle = "yellow";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(anim.text, x * scale, y * scale);
    ctx.restore();
  });
  toRemove.reverse().forEach(i => streakAnimations.splice(i, 1));
};




    // ——————————————————————————————————————————————
    // 13) Aumentar dificultad estándar (cada 5 aciertos)
    // ——————————————————————————————————————————————
    const increaseDifficulty = () => {
      const now = performance.now();
      const elapsed = now - gameStartTime;

      if (elapsed < 180000) {
        speed += 0.05;
        dropInterval = BASE_INTERVAL / speed;
        maxDrops = Math.min(7, maxDrops + 1);
      } else {
        speed = 2.3;
        dropInterval = BASE_INTERVAL / speed;
        // maxDrops se mantiene como está (no se incrementa más)
      }
    };

    // ——————————————————————————————————————————————
    // 14) Indicador de riesgo: borde parpadeante si errores >= 3
    // ——————————————————————————————————————————————
    const checkWarning = () => {
      if (missed >= 2 && missed < MAX_MISSED) {
        canvas.classList.add('warning');
      } else {
        canvas.classList.remove('warning');
      }
    };

    // ——————————————————————————————————————————————
    // 15) Crear animación de racha (nuevo):
    //     Se ejecuta cada vez que haya un acierto en racha
    // ——————————————————————————————————————————————
    const showStreakEffect = (streakCount, dropX, dropY) => {
      // El texto que vamos a animar
      const text = `x${streakCount}`;

      // Coordenada final donde está el HUD “Racha:”
      // (20, 90) es donde dibujamos “Racha: X” en drawDrops → centrar ahí el texto
      const targetX = 20 + 50; // +50 para que quede centrado en “Racha:”
      const targetY = 90;

      streakAnimations.push({
        text: text,
        x0: dropX,
        y0: dropY,
        x1: targetX,
        y1: targetY,
        t: 0
      });
    };

    // ——————————————————————————————————————————————
    // 16) Verificar respuesta al presionar “Enter”
    // ——————————————————————————————————————————————
    const checkAnswer = () => {
      const now = performance.now();
      if (now - lastAnswerTime < 500) return; // Esperar 500ms entre respuestas
      lastAnswerTime = now;
      const ans = parseInt(answerInput.value.trim());
      if (Number.isNaN(ans)) return;

      // ✅ Evitar procesar respuestas si no hay gotas
      if (raindrops.length === 0) return;

      let hit = false;
      raindrops = raindrops.filter(d => {
        if (d.res === ans) {
          hit = true;
          hitTimes.push(now);

          // ✅ Registrar tiempo de respuesta si estamos en el primer minuto
          if (adaptiveEnabled && now < adaptiveEnd) {
            const responseTime = now - d.createdAt;
            responseTimes.push(responseTime);

            // Limitar a las últimas 15 respuestas
            if (responseTimes.length > 15) {
              responseTimes.shift();
            }
          }

          // ————————————————————————————————
          // 1) Disparar contrarreloj si aplica
          // ————————————————————————————————
          if (
            !inTimeTrial &&
            !timeTrialPending &&
            now - gameStartTime >= 70_000 &&
            ++positiveStreakAfter2Min >= 11
          ) {
            timeTrialPending = true;
            timeTrialPendingStart = now;
            raindrops = [];
            missed = 0;
            positiveStreakAfter2Min = 0;
          }

          // ————————————————————————————————
          // 2) Racha y puntaje
          // ————————————————————————————————
          consecutiveHits++;
          if (consecutiveHits <= 3) {
            streak = 0;
            score += 1;
          } else {
            streak++;
            const multiplier = streak + 1;
            score += multiplier;
            showStreakEffect(multiplier, d.x, d.y);
          }

          correctSound.currentTime = 0;
          correctSound.play();

          // ————————————————————————————————
          // 3) Gotas especiales
          // ————————————————————————————————
          if (d.special && !inTimeTrial) {
            const elapsed = now - gameStartTime;
            missed = 0;
            checkWarning(); // ✅ desactiva el efecto visual si se había activado
            raindrops = [];
            maxDrops = 3;

            if (elapsed < 180000) {
              speed = 1.7;
            } else {
              speed = 2.3;
            }

            for (let i = 0; i < 3; i++) createDrop();
          }

          // ————————————————————————————————
          // 4) Aumentar dificultad cada 5 puntos
          // ————————————————————————————————
          if (score % 5 === 0) increaseDifficulty();

          // ————————————————————————————————
          // 5) Partículas
          // ————————————————————————————————
          animateParticles(d.x, d.y);


          return false; // eliminar gota correcta
        }

        return true;
      });

      if (!hit) {
        consecutiveHits = 0;
        streak = 0;
      }

      if (!hit && !inTimeTrial && !timeTrialPending && now - gameStartTime >= 70_000) {
        positiveStreakAfter2Min = 0;
      }

      answerInput.value = '';
    };

    // ——————————————————————————————————————————————
    // 17) Pequeña animación de partículas al acertar
    // ——————————————————————————————————————————————
    const animateParticles = (x, y) => {
      let parts = Array.from({ length: 13 }, () => ({
        x, y, alpha: 1,
        dx: (Math.random() - 0.5) * 5.5,
        dy: (Math.random() - 0.5) * 5.5,
        size: rand(3, 7)
      }));

      (function anim() {
        ctx.clearRect(x - DROP_RADIUS, y - DROP_RADIUS, DROP_RADIUS * 2, DROP_RADIUS * 2);
        parts.forEach(p => {
          p.x += p.dx;
          p.y += p.dy;
          p.alpha -= 0.04;
          ctx.fillStyle = `rgba(30,200,255,${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        parts = parts.filter(p => p.alpha > 0);
        if (parts.length) requestAnimationFrame(anim);
      })();
    };

    // ——————————————————————————————————————————————
    // 18) Bucle principal del juego
    // ——————————————————————————————————————————————
    const gameLoop = ts => {
      if (!gameRunning) {
        // 🧹 Borra todo el canvas para que no queden gotas visibles
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return; // ⬅️ Detener el bucle hasta reiniciar
      }
    
      const now = performance.now();
    
      // 1) Mostrar mensaje “¡CONTRARRELOJ!” antes de iniciar
      if (timeTrialPending) {
        drawDrops(); // Dibuja fondo y gotas actuales
        ctx.save();
        ctx.fillStyle = "purple";
        ctx.font = "48px 'Comic Sans MS'";
        ctx.textAlign = "center";
        ctx.fillText("¡CONTRARRELOJ!", canvas.width / 2, canvas.height / 2);
        ctx.restore();
    
        // Después de 1 segundo, comienza el contrarreloj
        if (now - timeTrialPendingStart >= 1000) {
          timeTrialPending = false;
          inTimeTrial = true;
          timeTrialStart = now;
    
          // Limpiar estado
          raindrops = [];
          missed = 0;
    
          // ✅ Agregar clase visual al canvas
          canvas.classList.add('time-trial-mode');
    
          // Aumentar velocidad
          speed *= 1.6;
        }
    
        requestAnimationFrame(gameLoop);
        return;
      }
    
      // 2) Lógica durante contrarreloj
      if (inTimeTrial) {
        const ttElapsed = now - timeTrialStart;
    
        // Mostrar advertencia en los últimos 3 segundos
        if (ttElapsed >= TIME_TRIAL_DURATION - 3000) {
          canvas.classList.add('time-trial-warning');
        }
    
        // Termina el contrarreloj
        if (ttElapsed >= TIME_TRIAL_DURATION) {
          inTimeTrial = false;
    
          // ✅ Quitar clases visuales
          canvas.classList.remove('time-trial-mode', 'time-trial-warning');
    
          speed /= 1.5;
          missed = 0;
        }
      }
    
      // 3) Aumentar dificultad después de 3 minutos
      if (now - gameStartTime >= 180_000) {
        maxDrops = 9;
      }
    
      // 4) Mover y dibujar
      updateDrops();
      drawDrops();
    
      // 5) Ajuste de dificultad automática
      if (adaptiveEnabled && now - lastAdaptiveCheck > 5000) {
        lastAdaptiveCheck = now;
    
        if (responseTimes.length >= 5) {
          const avgResponse = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    
          if (avgResponse < 2000 && speed < 2.5) {
            speed += 0.05;
          } else if (avgResponse > 3500 && speed > 1.2) {
            speed -= 0.05;
          }
    
          dropInterval = BASE_INTERVAL / speed;
        }
    
        if (now >= adaptiveEnd) {
          adaptiveEnabled = false;
          responseTimes = [];
        }
      }
    
      // 6) Crear nuevas gotas
      if (now - lastTime > dropInterval) {
        createDrop();
        lastTime = now;
      }
    
      // 7) Cambiar estilo visual cada 30 segundos
      if (!window.lastStyleChange) window.lastStyleChange = now;
      if (!window.currentStyleIndex && window.currentStyleIndex !== 0) window.currentStyleIndex = 0;
    
      if (now - window.lastStyleChange >= 30000) {
        window.currentStyleIndex = (window.currentStyleIndex + 1) % styles.length;
        window.lastStyleChange = now;
    
        canvas.classList.remove(...styles);
        const currentStyle = styles[window.currentStyleIndex];
        canvas.classList.add(currentStyle);
      }
    
      requestAnimationFrame(gameLoop);
    };

    // 📌 Función para mostrar el conteo regresivo
    function playCountdown(callback) {
      // Ocultar y desactivar el botón mientras dura el conteo
      if (startButton) {
        startButton.style.display = 'none';
        startButton.disabled = true;
      }

      const overlay = document.createElement('div');
      overlay.id = 'countdownOverlay';
      canvas.parentElement.appendChild(overlay);

      let count = 3;
      overlay.textContent = count;

      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          overlay.textContent = count;
        } else if (count === 0) {
          overlay.textContent = '¡GO!';
          // Mostrar "GO!" un momento antes de iniciar
          setTimeout(() => {
            clearInterval(interval);
            overlay.remove();
            callback(); // Inicia el juego
          }, 500);
        }
      }, 1000);
    }

    // ——————————————————————————————————————————————
    // 19) Iniciar partida
    // ——————————————————————————————————————————————

function startGameReal() {
  if (gameRunning) return;
  if (hsContainer) hsContainer.style.display = 'none';
  startMessage?.remove();

  // — Inicialización de variables del juego
  raindrops = [];
  speed = 1.5;
  score = 0;
  missed = 0;
  totalWrong = 0;
  maxDrops = 3;
  streak = 0;
  hitTimes = [];
  missTimes = [];
  lastAdaptiveCheck = performance.now();
  streakAnimations.length = 0;

  gameStartTime = performance.now();
  gameRunning = true;

  answerInput.style.display = 'inline-block';
  adaptiveStart = performance.now();
  adaptiveEnd = adaptiveStart + 60000;
  adaptiveEnabled = true;

  canvas.classList.remove('warning');
  endMessageDiv.style.display = 'none';

  dropInterval = BASE_INTERVAL / speed;
  lastTime = performance.now();
  answerInput.focus();

  // — Iniciar fondo dinámico
  window.bgAnimation.start();

  requestAnimationFrame(gameLoop);
}

// Iniciar con conteo regresivo
function startGame() {
  playCountdown(startGameReal);
}

// ——————————————————————————————————————————————
// 20) Finalizar partida
// ——————————————————————————————————————————————
const endGame = async () => {
  gameRunning = false;
  raindrops = []; // limpieza inmediata

  ctx.clearRect(0, 0, canvas.width, canvas.height); // borra canvas principal

  answerInput.style.display = 'none';
  finalMessage.innerHTML = `
    <p class="final-msg">¡Perdiste! Puntuación final: ${score}</p>
    <p class="final-msg">Incorrectas: <strong>${totalWrong}</strong></p>
    <p class="final-msg special">¡Puedes Superarlo!</p>
  `;
  endMessageDiv.style.display = 'block';

  // — Detener fondo dinámico
  window.bgAnimation.stop();

  await renderHighScores(score);

  setTimeout(() => {
    if (endMessageDiv.style.display === 'block') {
      startButton.textContent = 'Reiniciar';
      startButton.style.display = 'block';
      startButton.disabled = false;
    }
  }, 3000);
};

    // ——————————————————————————————————————————————
    // 21) Eventos sobre input y botón
    // ——————————————————————————————————————————————
    answerInput.addEventListener("input", () => {
      // Eliminar espacios automáticamente
      answerInput.value = answerInput.value.replace(/\s+/g, '');

      // Limitar a máximo 4 caracteres
      if (answerInput.value.length > 4) {
        answerInput.value = answerInput.value.slice(0, 4);
      }
    });

    // Control de teclado
    answerInput.addEventListener("keydown", e => {
      const raw = answerInput.value.trim();
      const isValid = /^\d+$/.test(raw); // Solo dígitos

      // Bloquear teclas que no sean numéricas, Backspace o Enter
      if (!/[0-9]/.test(e.key) && !['Backspace', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }

      // Bloquear Enter si el input está vacío o no es válido
      if (e.key === 'Enter') {
        e.preventDefault();
        if (gameRunning && isValid) {
          checkAnswer();
        }
      }
    });

    // Botón de inicio
    startButton.addEventListener("click", startGame);

    // Calcular primer dropInterval
    dropInterval = BASE_INTERVAL / speed;

  });

  // Suponiendo que ya tienes esto:
  const answerInput = document.getElementById('answerInput');
  const canvas = document.getElementById('gameCanvas');  // o tu container principal

  // Al hacer clic en el canvas, enfocar el input
  canvas.addEventListener('click', () => {
    answerInput.focus();
  });

})();
