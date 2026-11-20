import {
  state, content, timerDisplay, startBtn, closeBtn,
  rand, signalStart, signalEnd,
  showModalButtons, closeOverlay
} from '../app.js';

export const META = {
  label: 'Шлакоблокунь',
  time: 60,
  points: 3,
  words: [
    { word: 'БЕГЕМОТЫГА', image: 'image/Бегемотыга.jpg' },
    { word: 'КАШАЛОТОС', image: 'image/Кашалотос.jpg' },
    { word: 'НОСОРОГАЛИК', image: 'image/Носорогалик.jpg' },
    { word: 'САМОВАРАН', image: 'image/Самоваран.jpg' },
    { word: 'СКАТОК', image: 'image/Скаток.jpg' }
  ]
};

let currentInput = [];
let activeIndex = 0;

/* Открытие (модальное окно с правилами) */
export function open(currentGame) {
  currentGame.currentItem = rand(META.words);

  content.innerHTML = `
    <div class="word" style="font-size: 1.8rem; margin-bottom: 10px;">Шлакоблокунь</div>
    <div class="points" style="margin-bottom: 20px;">Угадай слово по картинке!</div>
    <div class="points">Баллы: ${META.points}</div>
  `;
  timerDisplay.classList.remove('hidden');
  timerDisplay.innerHTML = `<span class="timer-label">Время:</span> ${META.time}`;
  showModalButtons();
  startBtn.classList.remove('hidden');
  startBtn.onclick = () => start(currentGame);
  closeBtn.onclick = closeOverlay;
}

/* Старт (Обратный отсчет в модальном окне) */
function start(currentGame) {
  if (state.isRunning) return;
  state.isRunning = true;

  startBtn.classList.add('hidden');
  closeBtn.classList.add('hidden');
  timerDisplay.classList.add('hidden');

  let count = 3;
  content.innerHTML = `<div class="countdown">${count}</div>`;

  state.countdownInterval = setInterval(() => {
    count--;

    if (count === 2) {
      content.innerHTML = `<div class="countdown">2</div>`;
    } else if (count === 1) {
      content.innerHTML = `<div class="countdown">1</div>`;
    } else if (count === 0) {
      content.innerHTML = `<div class="countdown">Старт!</div>`;
      signalStart();
    } else if (count === -1) {
      clearInterval(state.countdownInterval);
      state.countdownInterval = null;
      launchGameScreen(currentGame);
    }
  }, 1000);
}

/* Открытие полноэкранной игры */
function launchGameScreen(currentGame) {
  document.getElementById('overlay').classList.add('hidden');

  let gameOverlay = document.getElementById('shakoblokun-overlay');
  if (!gameOverlay) {
    gameOverlay = document.createElement('div');
    gameOverlay.id = 'shakoblokun-overlay';
    gameOverlay.className = 'hidden';
    gameOverlay.innerHTML = `
      <div id="shako-topbar">
        <button id="shako-next-btn" class="btn green hidden">Дальше</button>
        <div id="shako-timer">60</div>
      </div>
      <div id="shako-content">
        <div id="shako-image-container">
          <img id="shako-image" src="" alt="Картинка">
        </div>
        <div id="shako-word-slots"></div>
        <div id="shako-message"></div>
      </div>
      <div id="shako-keyboard"></div>
    `;
    document.body.appendChild(gameOverlay);
  }

  const overlay = document.getElementById('shakoblokun-overlay');
  overlay.classList.remove('hidden');

  initGameLogic(currentGame);
}

/* Логика самой игры */
function initGameLogic(currentGame) {
  const currentWord = currentGame.currentItem.word;
  const currentImage = currentGame.currentItem.image;
  const wordLen = currentWord.length;

  currentInput = Array(wordLen).fill('');
  activeIndex = 0;

  const nextBtn = document.getElementById('shako-next-btn');
  nextBtn.classList.add('hidden');
  nextBtn.textContent = 'Дальше';

  const imgEl = document.getElementById('shako-image');
  imgEl.src = encodeURI(currentImage);
  imgEl.style.display = 'block';
  imgEl.onerror = () => { imgEl.style.display = 'none'; };

  const slotsContainer = document.getElementById('shako-word-slots');
  const keyboardContainer = document.getElementById('shako-keyboard');
  const messageEl = document.getElementById('shako-message');
  const timerEl = document.getElementById('shako-timer');

  // Слоты
  slotsContainer.innerHTML = '';
  for (let i = 0; i < wordLen; i++) {
    const slot = document.createElement('div');
    slot.className = 'shako-slot';
    slot.dataset.index = i;
    slot.onclick = () => {
      if (currentInput[i] !== '') {
        currentInput[i] = '';
        activeIndex = i;
        updateSlots();
      }
    };
    slotsContainer.appendChild(slot);
  }

  // Клавиатура ЙЦУКЕН
  keyboardContainer.innerHTML = '';

  const rows = [
    'ЙЦУКЕНГШЩЗХЪ',
    'ФЫВАПРОЛДЖЭ',
    'ЯЧСМИТЬБЮ'
  ];

  rows.forEach((rowString, rowIndex) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'shako-keyboard-row';

    if (rowIndex === 1) {
      rowDiv.style.paddingLeft = '4%';
      rowDiv.style.paddingRight = '4%';
    }

    rowString.split('').forEach(letter => {
      const key = document.createElement('button');
      key.className = 'shako-key';
      key.textContent = letter;
      key.onclick = () => handleKeyPress(letter);
      rowDiv.appendChild(key);
    });

    if (rowIndex === 2) {
      const backspaceKey = document.createElement('button');
      backspaceKey.className = 'shako-key shako-key-backspace';
      backspaceKey.textContent = '⌫';
      backspaceKey.onclick = () => {
        if (currentInput[activeIndex] !== '') {
          currentInput[activeIndex] = '';
          updateSlots();
        } else if (activeIndex > 0) {
          activeIndex--;
          currentInput[activeIndex] = '';
          updateSlots();
        }
      };
      rowDiv.appendChild(backspaceKey);
    }

    keyboardContainer.appendChild(rowDiv);
  });

  function handleKeyPress(letter) {
    let targetIndex = -1;
    if (currentInput[activeIndex] === '') {
      targetIndex = activeIndex;
    } else {
      targetIndex = currentInput.indexOf('');
    }

    if (targetIndex !== -1) {
      currentInput[targetIndex] = letter;
      activeIndex = targetIndex + 1;
      if (activeIndex >= wordLen) activeIndex = wordLen - 1;
      updateSlots();
    }
  }

  function updateSlots() {
    const slots = document.querySelectorAll('.shako-slot');
    slots.forEach((slot, index) => {
      slot.textContent = currentInput[index];
      slot.classList.remove('correct', 'wrong', 'active');

      if (index === activeIndex && currentInput[index] === '') {
        slot.classList.add('active');
      }
    });

    if (currentInput.every(letter => letter !== '')) {
      checkWin();
    }
  }

  function checkWin() {
    const guess = currentInput.join('');
    const slots = document.querySelectorAll('.shako-slot');

    if (guess === currentWord) {
      slots.forEach(slot => slot.classList.add('correct'));
      messageEl.textContent = 'Правильно!';
      messageEl.style.color = '#2e7d32';
      nextBtn.textContent = 'Дальше';
      nextBtn.classList.remove('hidden');
      clearInterval(state.timerInterval);
      state.timerInterval = null;
      signalStart();
    } else {
      slots.forEach(slot => slot.classList.add('wrong'));
      messageEl.textContent = 'Неправильно. Попробуйте еще раз!';
      messageEl.style.color = '#c62828';

      setTimeout(() => {
        slots.forEach(slot => slot.classList.remove('wrong'));
        messageEl.textContent = '';
      }, 1000);
    }
  }

  nextBtn.onclick = () => {
    endRound();
  };

  // Таймер игры
  let left = META.time;
  timerEl.textContent = left;
  timerEl.style.color = '#c62828';

  state.timerInterval = setInterval(() => {
    left--;
    timerEl.textContent = left;
    if (left <= 0) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
      signalEnd();
      messageEl.textContent = 'Время вышло! Слово: ' + currentWord;
      messageEl.style.color = '#c62828';
      nextBtn.textContent = 'Завершить';
      nextBtn.classList.remove('hidden');

      document.querySelectorAll('.shako-key').forEach(btn => btn.onclick = null);
    }
  }, 1000);

  function endRound() {
    const overlay = document.getElementById('shakoblokun-overlay');
    if (overlay) overlay.classList.add('hidden');
    state.isRunning = false;
    clearInterval(state.timerInterval);
    state.timerInterval = null;

    startBtn.classList.remove('hidden');
    closeBtn.classList.remove('hidden');

    closeOverlay();
  }
}

export function cleanup() {
  clearInterval(state.timerInterval);
  state.timerInterval = null;
  state.isRunning = false;
  const overlay = document.getElementById('shakoblokun-overlay');
  if (overlay) overlay.classList.add('hidden');
}