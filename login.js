'use strict';

(() => {
  const form = document.getElementById('login-form');
  const STORAGE_KEY = 'activeUsers';

  // Remover usuario al cerrar pestaña o salir
  window.addEventListener('beforeunload', () => {
    const user = sessionStorage.getItem('username');
    if (!user) return;

    const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updatedUsers = users.filter(u => u !== user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    const userInput = document.getElementById('username').value.trim();

    // Validación básica
    const valid = /^[A-Za-z0-9]{1,10}$/.test(userInput) && /[A-Za-z]/.test(userInput);
    if (!valid) {
      alert('Usuario inválido. Use solo letras y números (máx. 10) y al menos una letra. No se permiten espacios.');
      return;
    }

    const bannedWords = [
      'pene', 'pezon', 'pezones', 'vagina', 'culo', 'verga', 'culito','polla', 'raja', 'pepa', 'xvideo', 'panocha', 'bulba', 'cago', 'chichi',
      'sexo', 'mierda', 'tetas', 'nalgas', 'coño', 'mamar', 'pitudo','pija','rajita','bulba', 'porno', 'panochon', 'parcho', 'caga', 'chicho',
      'puto', 'puta', 'marica', 'chingar', 'sexual', 'mamo', 'cuca','vergon','tetita','xxx','pornhub', 'vulva','parcha', 'cola', 'cabezon',
      'prosti', 'scort', 'perra', 'bastard', 'golos', 'goloz','verg',
    ];

    const regex = new RegExp(`(${bannedWords.join('|')})`, 'i');
    if (regex.test(userInput)) {
      alert("Ese nombre contiene palabras no permitidas.");
      return;
    }

    // Revisar si el nombre está ya en uso
    const activeUsers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (activeUsers.includes(userInput)) {
      alert("Este nombre de usuario ya está en uso.");
      return;
    }

    // Guardar nombre en sessionStorage y localStorage
    sessionStorage.setItem('username', userInput);
    activeUsers.push(userInput);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeUsers));

    location.href = 'principal.html';
  });
})();

// Protección contra clic derecho e inspección
document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("keydown", e => {
  if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i")) {
    e.preventDefault();
  }
});

