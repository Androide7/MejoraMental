'use strict';

document.addEventListener("DOMContentLoaded", () => {

  // --- Evento para mostrar sección Inicio si existe ---
  const inicioLink = document.getElementById('inicio-link');
  const contenidoInicio = document.getElementById('contenido-inicio');

  if (inicioLink && contenidoInicio) {
    inicioLink.addEventListener('click', (e) => {
      e.preventDefault();
      contenidoInicio.style.display = 'block';
      // Aquí puedes ocultar otras secciones si lo deseas
    });
  }

  // --- Navegación ondulada con luz animada ---
  const menuToggle = document.getElementById("toggleMenu");
  const menuLinks = document.getElementById("menuLinks");
  const luz = document.getElementById("light");
  const linea = document.querySelector(".linea-ondulada");

  if (menuToggle && menuLinks) {
    menuToggle.addEventListener("click", () => {
      menuLinks.classList.toggle("active");
    });
  }

  if (luz && linea) {
    linea.addEventListener("mousemove", (e) => {
      const rect = linea.getBoundingClientRect();
      const x = e.clientX - rect.left;
      luz.style.left = `${x - luz.offsetWidth / 2}px`;
      luz.style.animation = "none"; // Detiene la animación suave al seguir el cursor
    });

    linea.addEventListener("mouseleave", () => {
      luz.style.animation = "luzLenta 20s linear infinite"; // Reactiva el movimiento suave
    });
  }
  // Cerrar el menú si se hace clic fuera
document.addEventListener("click", (e) => {
  // Si el menú está abierto y el clic NO fue dentro del toggleMenu ni menuLinks
  if (
    menuLinks.classList.contains("active") &&
    !menuLinks.contains(e.target) &&
    !menuToggle.contains(e.target)
  ) {
    menuLinks.classList.remove("active");
  }
});

});

document.addEventListener('DOMContentLoaded', () => {
  const toggleButtons = document.querySelectorAll('.toggle-info');

  toggleButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const extraInfo = button.nextElementSibling;
      if (!extraInfo) return;

      const isVisible = extraInfo.classList.contains('show');
      extraInfo.classList.toggle('show');

      button.textContent = isVisible
        ? 'VER MÁS INFORMACIÓN →'
        : 'OCULTAR INFORMACIÓN ↑';
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const block = entry.target;

      if (entry.intersectionRatio > 0.6) {
        block.classList.add("zoom-effect");
        block.classList.remove("zoom-waiting");
      } else {
        block.classList.add("zoom-waiting");

        setTimeout(() => {
          // Solo remueve si sigue marcada como esperando (evita parpadeo)
          if (block.classList.contains("zoom-waiting")) {
            block.classList.remove("zoom-effect");
            block.classList.remove("zoom-waiting");
          }
        }, 300); // puedes ajustar este retardo
      }
    });
  }, {
    threshold: [0, 0.6, 1] // mayor estabilidad
  });

  document.querySelectorAll(".bg-block").forEach(block => {
    observer.observe(block);
  });
});

