import { db, ref, onValue, set, push } from './firebaseConfig.js';

const duoSelectBtn = document.getElementById('duoSelect');
const userListContainer = document.getElementById('userListContainer');
const userList = document.getElementById('userList');

const currentUid = sessionStorage.getItem('uid');
const currentUsername = sessionStorage.getItem('username') || 'Jugador anónimo';

duoSelectBtn.addEventListener('click', () => {
  userListContainer.classList.toggle('hidden');

  if (!userListContainer.classList.contains('hidden')) {
    mostrarUsuariosEnLinea();
  }
});

function mostrarUsuariosEnLinea() {
  const usersRef = ref(db, 'onlineUsers');

  onValue(usersRef, (snapshot) => {
    userList.innerHTML = '';

    snapshot.forEach((child) => {
      const user = child.val();
      const uid = child.key;

      if (uid === currentUid) return;

      const username = user.username || 'Jugador desconocido';

      const li = document.createElement('li');
      li.textContent = username;
      li.classList.add('user-list-item');

      li.addEventListener('click', () => {
        userListContainer.classList.add('hidden');
        enviarInvitacion(uid, username);
      });

      userList.appendChild(li);
    });

    if (userList.children.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No hay usuarios disponibles';
      li.classList.add('user-list-empty');
      userList.appendChild(li);
    }
  });
}

function enviarInvitacion(uidDestino, nombreDestino) {
  const invitacionesRef = ref(db, `invitaciones/${uidDestino}`);
  const nuevaInvitacion = {
    de: currentUid,
    nombre: currentUsername,
    timestamp: Date.now(),
    estado: 'pendiente' // se puede actualizar a 'aceptada' o 'rechazada'
  };

  // Usamos push para permitir múltiples invitaciones sin sobrescribir
  push(invitacionesRef, nuevaInvitacion)
    .then(() => {
      alert(`Invitación enviada a ${nombreDestino}`);
    })
    .catch((error) => {
      console.error('Error al enviar invitación:', error);
    });
}
