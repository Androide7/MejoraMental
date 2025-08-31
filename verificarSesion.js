'use strict';

(() => {
  const display = document.getElementById('user-display');
  const onlineDisplay = document.getElementById('usuarios-en-linea');
  const user = sessionStorage.getItem('username');

  const isValid = user && /^[A-Za-z0-9]{1,10}$/.test(user) && /[A-Za-z]/.test(user);
  if (!isValid) {
    sessionStorage.removeItem('username');
    location.href = 'index.html';
    return;
  }

  // Mostrar saludo
  if (display) {
    display.textContent = `Hola, ${user}`;
  }

  // Función para obtener usuarios únicos
  function getUniqueUsers(usersArray) {
    return [...new Set(usersArray)];
  }

  // Agregar usuario actual a la lista sin duplicados
  let activeUsers = JSON.parse(localStorage.getItem('activeUsers') || '[]');
  if (!activeUsers.includes(user)) {
    activeUsers.push(user);
    activeUsers = getUniqueUsers(activeUsers);
    localStorage.setItem('activeUsers', JSON.stringify(activeUsers));
  }

  // Mostrar cantidad de usuarios en línea
  function updateOnlineCount() {
    const activeUsers = JSON.parse(localStorage.getItem('activeUsers') || '[]');
    if (onlineDisplay) {
      onlineDisplay.textContent = `Usuarios en línea: ${activeUsers.length}`;
    }
  }
  updateOnlineCount();

  // Eliminar usuario de activeUsers
  function removeUser() {
    let users = JSON.parse(localStorage.getItem('activeUsers') || '[]');
    const index = users.indexOf(user);
    if (index !== -1) {
      users.splice(index, 1);
      localStorage.setItem('activeUsers', JSON.stringify(users));
      updateOnlineCount();
    }
  }

  // Eliminar al cerrar pestaña
  window.addEventListener("beforeunload", removeUser);

  // Inactividad: 10 minutos
  const INACTIVITY_LIMIT = 8 * 60 * 1000;
  let inactivityTimer;

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      removeUser();
      sessionStorage.removeItem('username');
      location.href = 'index.html';
    }, INACTIVITY_LIMIT);
  }

  // Escuchar actividad
  ['mousemove', 'keydown', 'mousedown', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer);
  });

  // Sincronizar con otras pestañas (por si cierran una)
  window.addEventListener("storage", e => {
    if (e.key === "activeUsers") {
      updateOnlineCount();
    }
  });

  // Iniciar
  resetInactivityTimer();
})();
  // Protección contra clic derecho e inspección básica
  // document.addEventListener("contextmenu", e => e.preventDefault());
  // document.addEventListener("keydown", e => {
  //   if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i")) {
  //     e.preventDefault();
  //   }
  // });