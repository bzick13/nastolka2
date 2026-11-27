import {
  state, content, timerDisplay, startBtn, closeBtn,
  rand, signalStart, signalEnd, soundYes, soundNo,
  showModalButtons, closeOverlay
} from '../app.js';

export const META = {
  label: 'Да/Нет',
  time: 90,
  points: 3,
  words: [
    'Айболит', 'Александр Пушкин', 'Арнольд Шварценеггер', 'Артем Дзюба', 'Баста',
    'Бетмен', 'Буратино', 'Вин Дизель', 'Винни пух', 'Виктор Цой',
    'Владимир Владимирович Путин', 'Волан-де-Морт', 'Гарик Харламов', 'Гарри Поттер',
    'Гендальф', 'Гитлер', 'Губка Боб', 'Дамблдор', 'Джейсон Стейтем', 'Джеймс Бонд',
    'Джек Воробей', 'Джеки Чан', 'Джокер', 'Джонни Депп', 'Джим Керри', 'Дмитрий Билан',
    'Иван Грозный', 'Илон Маск', 'Карлсон', 'Киану Ривз', 'Колобок', 'Криштиану Роналдо',
    'Крокодил Гена', 'Леди Гага', 'Ленин', 'Леонардо Ди Каприо', 'Майк Тайсон',
    'Майкл Джексон', 'Майкл Джордан', 'Маугли', 'Моцарт', 'Ольга Бузова', 'Оптимус Прайм',
    'Павел Воля', 'Петр 1', 'Сальвадор Дали', 'Сергей Есенин', 'Сергей Шнуров', 'Снуп Дог',
    'Стив Джобс', 'Стив Роджерс (Капитан Америка)', 'Супермен', 'Терминатор',
    'Тони Старк (Железный человек)', 'Тор', 'Филипп Киркоров', 'Фредди Крюгер', 'Халк',
    'Чак Норрис', 'Чебурашка', 'Человек паук', 'Шапокляк', 'Шерлок Холмс', 'Шрек',
    'Элвис Пресли', 'Эминем', 'Юлий Цезарь', 'Юрий Гагарин'
  ]
};

// === МЕХАНИЗМ НЕПОВТОРЯЮЩИХСЯ СЛОВ ===
let wordDeck = [];
let lastWord = null;

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getNextWord() {
  if (wordDeck.length === 0) {
    wordDeck = shuffle(META.words);
    if (wordDeck[0] === lastWord && wordDeck.length > 1) {
      [wordDeck[0], wordDeck[1]] = [wordDeck[1], wordDeck[0]];
    }
  }
  const word = wordDeck.pop();
  lastWord = word;
  return word;
}
// ======================================

export function open(currentGame) {
  currentGame.currentWord = getNextWord(); // <-- ИЗМЕНЕНО

  content.innerHTML = `
    <div class="word">${currentGame.currentWord}</div>
    <div class="points">Баллы: ${META.points}</div>
  `;
  timerDisplay.classList.remove('hidden');
  timerDisplay.innerHTML = `<span class="timer-label">Время:</span> ${META.time}`;

  const yesnoButtons = document.getElementById('yesno-buttons');
  if (yesnoButtons) yesnoButtons.classList.add('hidden');

  showModalButtons();
  startBtn.classList.remove('hidden');
  startBtn.onclick = () => start(currentGame);
  closeBtn.onclick = closeOverlay;
}

function start(currentGame) {
  if (state.isRunning) return;
  state.isRunning = true;
  startBtn.classList.add('hidden');

  let count = 3;
  content.innerHTML = `<div class="countdown">${count}</div>`;

  state.countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      content.innerHTML = `<div class="countdown">${count}</div>`;
    } else if (count === 0) {
      content.innerHTML = `<div class="countdown">Старт!</div>`;
      signalStart();
    } else {
      clearInterval(state.countdownInterval);
      state.countdownInterval = null;
      content.innerHTML = `
        <div class="word">${currentGame.currentWord}</div>
        <div class="points">Баллы: ${META.points}</div>
      `;

      // --- ПРОВЕРКА УСЛОЖНЕНИЯ "ОТВЕЧАТЬ КНОПКАМИ" ---
      const isButtonsMode = currentGame.hardMode && currentGame.hardMode.text === 'Отвечать на вопросы кнопками.';
      const yesnoButtons = document.getElementById('yesno-buttons');
      const yesBtn = document.getElementById('yn-yes-btn');
      const noBtn = document.getElementById('yn-no-btn');

      if (isButtonsMode && yesnoButtons) {
        yesnoButtons.classList.remove('hidden');

        yesBtn.onclick = () => soundYes();
        noBtn.onclick = () => soundNo();
      }
      // ------------------------------------------------

      startTimer();
    }
  }, 1000);
}

function startTimer() {
  let left = META.time;
  timerDisplay.innerHTML = `<span class="timer-label">Время:</span> ${left}`;
  timerDisplay.classList.remove('hidden');

  state.timerInterval = setInterval(() => {
    left--;
    timerDisplay.innerHTML = `<span class="timer-label">Время:</span> ${left}`;
    if (left <= 0) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
      timerDisplay.innerHTML = `<span class="timer-label">Время:</span> 0`;
      signalEnd();
      state.isRunning = false;

      const yesnoButtons = document.getElementById('yesno-buttons');
      if (yesnoButtons) yesnoButtons.classList.add('hidden');
    }
  }, 1000);
}

export function cleanup() {
  const yesnoButtons = document.getElementById('yesno-buttons');
  if (yesnoButtons) yesnoButtons.classList.add('hidden');
}