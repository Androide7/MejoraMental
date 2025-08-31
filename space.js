const contenedor = document.getElementById('espacio');
let mouseX = 0.6, mouseY = 0.6;
let offsetActualX = 0, offsetActualY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX / window.innerWidth;
  mouseY = e.clientY / window.innerHeight;
});

function crearEstrella() {
  const estrella = document.createElement('div');
  const isFugaz = Math.random() < 0.03;

  estrella.className = 'estrella';
  if (isFugaz) estrella.classList.add('fugaz');

  const size = isFugaz ? 3 : Math.random() * 2 + 1;
  estrella.style.width = `${size}px`;
  estrella.style.height = `${size}px`;

  const left = Math.random() * 100;
  const top = Math.random() * 100;
  estrella.style.left = `${left}%`;
  estrella.style.top = `${top}%`;

  // Trayectoria personalizada para fugaz
  if (isFugaz) {
    const haciaCentro = Math.random() < 0.5;
    if (haciaCentro) {
      const centroX = 50;
      const centroY = 50;
      const dx = centroX - left;
      const dy = centroY - top;
      estrella.style.setProperty('--trayectoria', `translate(${dx}vw, ${dy}vh)`);
    } else {
      const dx = (Math.random() * 200 + 100) * (Math.random() < 0.5 ? -1 : 1);
      const dy = (Math.random() * 200 + 100) * (Math.random() < 0.5 ? -1 : 1);
      estrella.style.setProperty('--trayectoria', `translate(${dx}px, ${dy}px)`);
    }
  }

  contenedor.appendChild(estrella);
  setTimeout(() => estrella.remove(), isFugaz ? 4900 : 49000);

  if (!isFugaz && Math.random() < 0.015) {
    const x = estrella.offsetLeft + size / 2;
    const y = estrella.offsetTop + size / 2;
    generarExplosion(x, y);
  }
}

function generarExplosion(x, y) {
  if (x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight) return;

  const colores = [
    ['rgba(255, 0, 102, 0.8)', 'rgba(255, 0, 0, 0)'],
    ['rgba(0, 255, 255, 0.8)', 'rgba(0, 128, 255, 0)'],
    ['rgba(255, 215, 0, 0.8)', 'rgba(255, 140, 0, 0)'],
    ['rgba(0, 255, 128, 0.8)', 'rgba(0, 100, 50, 0)'],
    ['rgba(180, 0, 255, 0.8)', 'rgba(100, 0, 255, 0)'],
  ];
  const [colorPrincipal, colorSecundario] = colores[Math.floor(Math.random() * colores.length)];

  // 1) Estruendo inicial (simulado)
  reproducirEstruendo();

  // 2) Chispa inicial
  setTimeout(() => crearChispaElectrica(x, y), 200);

  // 3) Partículas pequeñas
  setTimeout(() => generarParticulas(x, y, colorPrincipal), 600);

  // 4) Explosión principal + glow
  setTimeout(() => {
    const expl = document.createElement('div');
    expl.className = 'explosion';
    expl.style.left = `${x - 50}px`;
    expl.style.top = `${y - 50}px`;
    expl.style.background = `radial-gradient(circle at center, ${colorPrincipal}, ${colorSecundario})`;
    contenedor.appendChild(expl);
    setTimeout(() => expl.remove(), 3000);

    const glow = document.createElement('div');
    glow.className = 'supernova-glow';
    glow.style.left = `${x - 75}px`;
    glow.style.top = `${y - 75}px`;
    contenedor.appendChild(glow);
    setTimeout(() => glow.remove(), 1200);

    // 🌌 Agregar nebulosa en algunas explosiones (30% probabilidad)
    if (Math.random() < 0.5) {
      const nebulosa = document.createElement('div');
      nebulosa.className = 'nebulosa';
      nebulosa.style.left = `${x - 60 + Math.random() * 20}px`;
      nebulosa.style.top = `${y - 60 + Math.random() * 20}px`;

      // Forma amorfa aleatoria
      const r1 = Math.floor(Math.random() * 40) + 30;
      const r2 = 100 - r1;
      const r3 = Math.floor(Math.random() * 40) + 30;
      const r4 = 100 - r3;
      nebulosa.style.borderRadius = `${r1}% ${r2}% ${r3}% ${r4}% / ${r4}% ${r3}% ${r2}% ${r1}%`;

      // Color aleatorio galáctico
      const colors = [
        'rgba(200, 100, 255, 0.25)',
        'rgba(100, 255, 200, 0.25)',
        'rgba(255, 150, 100, 0.25)',
        'rgba(255, 255, 150, 0.25)',
        'rgba(150, 100, 255, 0.25)'
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      nebulosa.style.background = `radial-gradient(circle, ${color} 0%, transparent 80%)`;

      // Movimiento aleatorio hacia el centro o laterales con suavidad
      const dirX = (Math.random() - 0.5) * 200; // -100 a +100 px
      const dirY = (Math.random() - 0.5) * 200; // -100 a +100 px
      const scale = 1.5 + Math.random(); // escala final entre 1.5 y 2.5

      nebulosa.style.setProperty('--dx', `${dirX}px`);
      nebulosa.style.setProperty('--dy', `${dirY}px`);
      nebulosa.style.setProperty('--sf', scale);

      contenedor.appendChild(nebulosa);

      setTimeout(() => nebulosa.remove(), 42000); // 41s + 1s
    }

  }, 1000);

  // 5) Chispas lentas
  setTimeout(() => {
    crearChispasLentas(x, y, colorPrincipal);
  }, 1800);

  // 6) Ondas
  setTimeout(() => {
    generarOnda(x, y);
    crearOndaVidrio(x, y);
  }, 1200);

  // 7) Humo flotante
  setTimeout(() => {
    generarHumo(x, y);
  }, 3900);
}

function crearHumoExplosion(x, y, color) {
  for (let i = 0; i < 4; i++) { // Crear 4 partículas de humo por explosión
    const humo = document.createElement('div');
    humo.className = 'humoexplosion';

    // Posición aleatoria cerca del centro de la explosión
    const offsetX = (Math.random() - 0.5) * 80; // desplazamiento horizontal aleatorio
    const offsetY = (Math.random() - 0.5) * 80; // desplazamiento vertical aleatorio

    // Tamaño aleatorio entre 30px y 80px
    const size = 30 + Math.random() * 50;

    // Escala inicial aleatoria entre 0.5 y 1.3
    const scale = 0.5 + Math.random() * 0.8;

    // Aplicar tamaño, posición y color
    humo.style.width = `${size}px`;
    humo.style.height = `${size}px`;
    humo.style.left = `${x + offsetX}px`; // coordenada horizontal
    humo.style.top = `${y + offsetY}px`;  // coordenada vertical

    // Gradiente de color personalizado (basado en color de explosión)
    humo.style.background = `radial-gradient(${color}88 0%, transparent 70%)`;

    // Escala y rotación aleatoria para más realismo
    humo.style.transform = `scale(${scale}) rotate(${Math.random() * 360}deg)`;

    // Agregar al contenedor principal (donde ocurre la explosión)
    contenedor.appendChild(humo);

    // Eliminar el div después de 6 segundos para no saturar el DOM
    setTimeout(() => humo.remove(), 36000);
  }
}

function reproducirEstruendo() {
  const estruendo = document.createElement('div');
  estruendo.className = 'estruendo';
  contenedor.appendChild(estruendo);
  setTimeout(() => estruendo.remove(), 300);

  // Opcional: sonido
  // new Audio('boom.mp3').play();
}
function generarHumo(x, y) {
  const humo = document.createElement('div');
  humo.className = 'humo';
  humo.style.left = `${x - 40}px`;
  humo.style.top = `${y - 40}px`;
  contenedor.appendChild(humo);
  setTimeout(() => humo.remove(), 4000);
}

function generarParticulas(x, y, color) {
  const cantidad = 8 + Math.floor(Math.random() * 5);
  for (let i = 0; i < cantidad; i++) {
    const p = document.createElement('div');
    p.className = 'particula';
    const size = Math.random() * 3 + 2;

    // Movimiento limitado a un área segura
    const dx = Math.random() * 40 - 20;
    const dy = Math.random() * 40 - 20;
    const posX = Math.min(Math.max(x + dx - size / 2, 0), window.innerWidth - size);
    const posY = Math.min(Math.max(y + dy - size / 2, 0), window.innerHeight - size);

    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.background = color;
    p.style.left = `${posX}px`;
    p.style.top = `${posY}px`;

    contenedor.appendChild(p);
    setTimeout(() => p.remove(), 2000);
  }
}

function generarOnda(x, y) {
  const onda = document.createElement('div');
  onda.className = 'onda';
  onda.style.left = `${x - 20}px`;
  onda.style.top = `${y - 20}px`;
  contenedor.appendChild(onda);
  setTimeout(() => onda.remove(), 2500);
}

function crearOndaVidrio(x, y) {
  const onda = document.createElement('div');
  onda.className = 'onda-vidrio';
  onda.style.left = `${x - 40}px`;
  onda.style.top = `${y - 40}px`;
  contenedor.appendChild(onda);
  setTimeout(() => onda.remove(), 3000);
}

function crearChispaElectrica(x, y) {
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      const chispa = document.createElement('div');
      chispa.className = 'chispa-elec';
      const dx = (Math.random() - 0.5) * 120;
      const dy = (Math.random() - 0.5) * 120;
      chispa.style.setProperty('--dx', dx + 'px');
      chispa.style.setProperty('--dy', dy + 'px');
      chispa.style.left = `${x - 2}px`;
      chispa.style.top = `${y - 2}px`;
      contenedor.appendChild(chispa);
      setTimeout(() => chispa.remove(), 2000);
    }, i * 50); // Intervalos entre chispas
  }
}

function crearChispasLentas(x, y, colorPrimario) {
  const cantidad = 12 + Math.floor(Math.random() * 8);

  for (let i = 0; i < cantidad; i++) {
    const chispa = document.createElement('div');
    chispa.className = 'chispa-lenta';

    // Alternar entre blanco y el color de la explosión
    chispa.style.background = i % 2 === 0 ? 'white' : colorPrimario;
    chispa.style.boxShadow = `0 0 3px 1px ${i % 2 === 0 ? 'white' : colorPrimario}`;

    const dx = (Math.random() - 0.5) * 60;
    const dy = (Math.random() - 0.5) * 60;
    chispa.style.setProperty('--dx', `${dx}px`);
    chispa.style.setProperty('--dy', `${dy}px`);

    chispa.style.left = `${x}px`;
    chispa.style.top = `${y}px`;

    contenedor.appendChild(chispa);
    setTimeout(() => chispa.remove(), 3500);
  }
}

function bucle() {
  if (Math.random() < 0.08) { // 👈 solo un 10% de las veces se crea una estrella
    crearEstrella();
  }

  const offsetTargetX = (mouseX - 0.5) * 20;
  const offsetTargetY = (mouseY - 0.5) * 20;
  offsetActualX += (offsetTargetX - offsetActualX) * 0.05;
  offsetActualY += (offsetTargetY - offsetActualY) * 0.05;
  contenedor.style.transform = `translate(${offsetActualX}px, ${offsetActualY}px)`;

  requestAnimationFrame(bucle);
}
bucle();
const espacio = document.getElementById("espacio");

const blackHole = document.createElement("div");
blackHole.className = "black-hole";
espacio.appendChild(blackHole);

const vortex = document.createElement("div");
vortex.className = "hole-vortex";
espacio.appendChild(vortex);

const spark = document.createElement("div");
spark.className = "electricity";
espacio.appendChild(spark);

