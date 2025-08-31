(() => {
    'use strict';
    const user = sessionStorage.getItem('username');
    if (!user || !/^[A-Za-z0-9]{1,10}$/.test(user)) {
      // Si no hay sesión válida, redirigimos
      window.location.href = 'index.html';
      return;
    }
    // Inyectar saludo si existe el contenedor
    const display = document.getElementById('user-display');
    if (display) display.textContent = `Hola, ${user}`;
  })();