const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('gameContainer'); // canvas se adapta al contenedor

let shapes = [];
let shapeMode = 'square'; // 'square' o 'triangle'
let nextShapeMode = 'triangle';
let transitionProgress = 0;
let isTransitioning = false;

let animationId = null; // para controlar requestAnimationFrame

const CHANGE_INTERVAL = 20000; // 20 segundos
const TRANSITION_DURATION = 5000; // 5 segundos

const colors = [
  '#ff4d94', '#ff6699', '#ff80a6', // rosados
  '#668cff', '#809fff', '#99b3ff'  // azules
];

function resizeCanvases() {
  const container = document.getElementById('gameContainer');
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Fondo
  const bgCanvas = document.getElementById('bgCanvas');
  bgCanvas.width = width;
  bgCanvas.height = height;

  // Juego
  const gameCanvas = document.getElementById('gameCanvas');
  gameCanvas.width = width;
  gameCanvas.height = height;
}

// Ajustar en carga y resize
window.addEventListener('resize', resizeCanvases);
resizeCanvases();


// Cambio de figuras programado
function scheduleShapeChange() {
  setTimeout(() => {
    isTransitioning = true;
    nextShapeMode = (shapeMode === 'square') ? 'triangle' : 'square';
    const startTime = Date.now();

    function doTransition() {
      const elapsed = Date.now() - startTime;
      transitionProgress = Math.min(elapsed / TRANSITION_DURATION, 1);

      if (transitionProgress < 1) {
        requestAnimationFrame(doTransition);
      } else {
        shapeMode = nextShapeMode;
        isTransitioning = false;
        transitionProgress = 0;
        scheduleShapeChange();
      }
    }
    doTransition();
  }, CHANGE_INTERVAL);
}

// Funciones de figuras (sin cambios)
function createShape() {
  let type;
  if (Math.random() < 0.3) type = 'line';
  else if (isTransitioning) type = Math.random() < (1 - transitionProgress) ? shapeMode : nextShapeMode;
  else type = shapeMode;

  const x = Math.random() * canvas.width;
  const y = -20;
  const size = Math.random() * 8 + 6;
  const speed = Math.random() * 0.8 + 0.2;
  const color = colors[Math.floor(Math.random() * colors.length)];
  const isOutline = Math.random() < 0.3;

  return { type, x, y, size, speed, color, isOutline };
}

function drawShape(s) {
  if (s.type === 'square') {
    if (s.isOutline) {
      ctx.strokeStyle = s.color; ctx.lineWidth = 1.5; ctx.strokeRect(s.x, s.y, s.size, s.size);
    } else {
      ctx.fillStyle = s.color; ctx.fillRect(s.x, s.y, s.size, s.size);
    }
  } else if (s.type === 'triangle') {
    ctx.beginPath();
    ctx.moveTo(s.x + s.size / 2, s.y);
    ctx.lineTo(s.x, s.y + s.size);
    ctx.lineTo(s.x + s.size, s.y + s.size);
    ctx.closePath();
    if (s.isOutline) { ctx.strokeStyle = s.color; ctx.lineWidth = 1.5; ctx.stroke(); }
    else { ctx.fillStyle = s.color; ctx.fill(); }
  } else if (s.type === 'line') {
    const grad = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.size * 4);
    grad.addColorStop(0, `${s.color}cc`);
    grad.addColorStop(1, `${s.color}33`);
    ctx.strokeStyle = grad; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x, s.y + s.size * 4); ctx.stroke();
  }
}

function updateShapes() {
  shapes.forEach(s => s.y += s.speed);
  shapes = shapes.filter(s => s.y < canvas.height + 20);
}

// Funciones para interpolar colores hex
function hexToRgb(hex) {
  hex = hex.replace('#','');
  if (hex.length === 3) hex = hex.split('').map(x => x+x).join('');
  const bigint = parseInt(hex, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function lerpColor(a,b,t) {
  const c1 = hexToRgb(a), c2 = hexToRgb(b);
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b_ = Math.round(c1.b + (c2.b - c1.b) * t);
  return `rgb(${r},${g},${b_})`;
}

// Variables de fondo
let bgTransition = 0;
let bgDirection = 1;
const bgSpeed = 0.0001;

// Animación principal
function animate() {
  bgTransition += bgSpeed * bgDirection;
  if (bgTransition >= 1){ bgTransition=1; bgDirection=-1; }
  else if(bgTransition <= 0){ bgTransition=0; bgDirection=1; }

  const topColor = lerpColor("#120028","#00284f", bgTransition);
  const bottomColor = lerpColor("#2a0050","#0b1e7a", bgTransition);

  const gradient = ctx.createLinearGradient(0,0,0,canvas.height);
  gradient.addColorStop(0, topColor);
  gradient.addColorStop(1, bottomColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  if(Math.random() < 0.2) shapes.push(createShape());
  shapes.forEach(drawShape);
  updateShapes();

  animationId = requestAnimationFrame(animate);
}

// Funciones para control externo
function startBgAnimation() {
  if (!animationId) {
    document.getElementById('bgCanvas').style.display = 'block'; // mostrar canvas
    document.getElementById('gameContainer').style.background = 'none'; // quitar fondo estático
    scheduleShapeChange();
    animate();
  }
}

function stopBgAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

// Exportar control global
window.bgAnimation = { start: startBgAnimation, stop: stopBgAnimation };
