'use strict';
document.addEventListener('DOMContentLoaded', () => {
  const slidesContainer = document.querySelector('.carousel-slides');
  const slides = document.querySelectorAll('.carousel-slide');
  const total = slides.length;
  let index = 0;
  let timer;

  const nextBtn = document.querySelector('.carousel-btn.next');
  const prevBtn = document.querySelector('.carousel-btn.prev');

  function update() {
    slidesContainer.style.transform = `translateX(-${index * 100}%)`;
  }

  function next() {
    index = (index + 1) % total;
    update();
  }

  function prev() {
    index = (index - 1 + total) % total;
    update();
  }

  function startAuto() {
    clearInterval(timer);               // ¡IMPORTANTE!
    timer = setInterval(next, 20000);   // 20 000 ms = 20 segundos
  }

  function stopAuto() {
    clearInterval(timer);
  }

  // Eventos de flechas
  nextBtn.addEventListener('click', () => {
    next();
    stopAuto();
    startAuto();
  });
  prevBtn.addEventListener('click', () => {
    prev();
    stopAuto();
    startAuto();
  });

  // Pausar al pasar el ratón y reanudar al salir
  const carousel = document.querySelector('.carousel-container');
  carousel.addEventListener('mouseover', stopAuto);
  carousel.addEventListener('mouseout', startAuto);

  // Iniciar autoplay
  update();
  startAuto();
});
