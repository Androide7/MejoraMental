import { loadHighScores, saveHighScore } from './saveHighScoreRfjM.js';

export function renderHighScores(currentScore) {
  const user = sessionStorage.getItem('username') || 'Anónimo';
  let uid = sessionStorage.getItem('uid');
  if (!uid) {
    uid = crypto.randomUUID();
    sessionStorage.setItem('uid', uid);
  }

  const list = document.getElementById('highScoresList');
  const message = document.getElementById('specialMessage');
  const localKey = 'offlineScores_speed';
  const hsContainer = document.getElementById('highScoresContainer'); // opcional

  if (!list || !message) return;

  let topPosition = -1;
  let foundCurrent = false;

  list.innerHTML = '';
  message.textContent = '';
  message.classList.add('hidden');
  message.classList.remove('show', 'visible');

  if (navigator.onLine) {
    if (currentScore > 0) {
      saveHighScore(user, currentScore, uid);
    }

    loadHighScores((scores) => {
      list.innerHTML = '';

      scores
        .filter(entry => entry.score > 0)
        .slice(0, 100)
        .forEach(({ name, score, id }, i) => {
          const li = document.createElement('li');

          if (i === 0) {
            li.innerHTML = `<span class="top-text">${i + 1}. ${name}: ${score}</span> 👑`;
            li.classList.add('top-1');
          } else {
            li.textContent = `${i + 1}. ${name}: ${score}`;
            if (i === 1) li.classList.add('top-2');
            else if (i === 2) li.classList.add('top-3');
            else if (i === 3) li.classList.add('top-4');
            else li.classList.add('secondary-highlight');
          }

          if (!foundCurrent && name === user && score === currentScore && id === uid) {
            foundCurrent = true;
            li.classList.add('new-high');
            li.classList.add(i < 3 ? 'highlight-user-position-gold' : 'highlight-user-position-blue');
            topPosition = i + 1;
          }

          list.appendChild(li);
        });

      if (topPosition > 0 && topPosition <= 3) {
        const emojis = ['👑', '🥈', '🥉'];
        message.textContent = `🎉 ${emojis[topPosition - 1]} ¡Felicidades ${user}, estás en el Top ${topPosition}!`;
        message.classList.remove('hidden');
        message.classList.add('show');

        setTimeout(() => {
          message.classList.remove('show');
          message.textContent = '';
          message.classList.add('hidden');
        }, 9000);
      }

      if (hsContainer) hsContainer.style.display = 'block';
    });

  } else {
    // 📴 Sin conexión
    const localScores = JSON.parse(localStorage.getItem(localKey) || '[]');

    if (currentScore > 0) {
      localScores.push({ name: user, score: currentScore });
    }

    localScores.sort((a, b) => b.score - a.score);
    const topLocal = localScores.filter(s => s.score > 0).slice(0, 100);
    localStorage.setItem(localKey, JSON.stringify(topLocal));

    let foundCurrentOffline = false;

    topLocal.forEach(({ name, score }, i) => {
      const li = document.createElement('li');
      li.textContent = `${i + 1}. ${name}: ${score} (sin conexión)`;
      li.style.opacity = '0.7';

      if (i === 0) li.classList.add('top-1');
      else if (i === 1) li.classList.add('top-2');
      else if (i === 2) li.classList.add('top-3');
      else if (i === 3) li.classList.add('top-4');
      else li.classList.add('secondary-highlight');

      if (!foundCurrentOffline && name === user && score === currentScore) {
        foundCurrentOffline = true;
        li.classList.add('new-high');
        li.classList.add(i < 3 ? 'highlight-user-position-gold' : 'highlight-user-position-blue');
      }

      list.appendChild(li);
    });

    message.textContent = '⚠️ Sin conexión: mostrando top local';
    message.classList.remove('hidden');
    message.classList.add('visible');

    if (hsContainer) hsContainer.style.display = 'block';
  }
}

// 🔄 Sincronización automática al volver en línea
window.addEventListener('online', () => {
  const localKey = 'offlineScores_speed';
  const pendientes = JSON.parse(localStorage.getItem(localKey) || '[]');
  const uid = sessionStorage.getItem('uid') || crypto.randomUUID();
  sessionStorage.setItem('uid', uid);

  if (pendientes.length > 0) {
    pendientes
      .filter(entry => entry.score > 0)
      .forEach(({ name, score }) => saveHighScore(name, score, uid));

    localStorage.removeItem(localKey);
    console.log('🔄 Puntajes locales sincronizados');
  }
});
