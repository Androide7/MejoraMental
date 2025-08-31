'use strict';

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getDatabase, ref, set, onDisconnect, onValue } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBQcCGxrCgwlA8MM2vtZgVX28--Vuf7sFw",
  authDomain: "juegousuariosactivos.firebaseapp.com",
  projectId: "juegousuariosactivos",
  storageBucket: "juegousuariosactivos.firebasestorage.app",
  messagingSenderId: "896535330309",
  appId: "1:896535330309:web:9e96e6818c0288d93ae66c"
};

// Inicializar solo si no hay una app ya creada
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

// Obtener la base de datos
const db = getDatabase(app);

// Obtener usuario desde sessionStorage
const username = sessionStorage.getItem('username');
const STORAGE_KEY = 'activeUsers';

// Validación de formato
const isValidFormat = username && /^[A-Za-z0-9]{1,10}$/.test(username) && /[A-Za-z]/.test(username);

// Lista de palabras prohibidas
const bannedWords = [
  'pene', 'pezon', 'pezones', 'vagina', 'culo', 'verga', 'culito','polla', 'raja', 'pepa', 'xvideo', 'panocha', 'bulba', 'cago', 'chichi',
  'sexo', 'mierda', 'tetas', 'nalgas', 'coño', 'mamar', 'pitudo','pija','rajita','bulba', 'porno', 'panochon', 'parcho', 'caga', 'chicho',
  'puto', 'puta', 'marica', 'chingar', 'sexual', 'mamo', 'cuca','vergon','tetita','xxx','pornhub', 'vulva','parcha', 'cola', 'cabezon',
  'prosti', 'scort', 'perra', 'bastard', 'golos', 'goloz','verg',
];
const regex = new RegExp(`(${bannedWords.join('|')})`, 'i');

// Si es inválido o contiene palabras ofensivas, expulsar
if (!isValidFormat || regex.test(username)) {
  sessionStorage.removeItem('username');
  location.href = "index.html";
  throw new Error("Nombre de usuario inválido o prohibido.");
}

// Registrar usuario en Firebase y onDisconnect
// Obtener o generar UID
let uid = sessionStorage.getItem('uid');
if (!uid) {
  uid = crypto.randomUUID();
  sessionStorage.setItem('uid', uid);
}

const userRef = ref(db, 'onlineUsers/' + uid);
set(userRef, {
  username: username,
  timestamp: Date.now()
});
onDisconnect(userRef).remove();


// Contador en tiempo real
const totalRef = ref(db, 'onlineUsers');
onValue(totalRef, (snapshot) => {
  const total = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
  const div = document.getElementById('usuarios-en-linea');
  if (div) {
    div.textContent = `Usuarios en línea: ${total}`;
    div.classList.add('actualizado');
    setTimeout(() => div.classList.remove('actualizado'), 700);
  }
});

// ⚠️ Limpieza adicional al cerrar la pestaña: quitar del localStorage también
window.addEventListener('beforeunload', () => {
  if (!username) return;
  const activeUsers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const updatedUsers = activeUsers.filter(u => u !== username);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
});
