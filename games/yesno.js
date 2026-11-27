import {
  state, content, timerDisplay, startBtn, closeBtn,
  rand, signalStart, signalEnd, soundYes, soundNo, // Импортируем звуки
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

export function open(currentGame) {
  currentGame.currentWord = rand(META.words);

  content.innerHTML = `
    <div class="word">${currentGame.currentWord}</div>
    <div class="points">Баллы: ${META.points}</div>
  `;
  timerDisplay.classList.remove('hidden');
  timerDisplay.innerHTML = `<span class="timer-label">Время:</span> ${META.time}`;
  
  // Скрываем кнопки Да/Нет при открытии правил
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
        
        // Вешаем звуки на кнопки
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

      // Скрываем кнопки в конце
      const yesnoButtons = document.getElementById('yesno-buttons');
      if (yesnoButtons) yesnoButtons.classList.add('hidden');
    }
  }, 1000);
}

export function cleanup() {
  // При закрытии игры скрываем кнопки Да/Нет
  const yesnoButtons = document.getElementById('yesno-buttons');
  if (yesnoButtons) yesnoButtons.classList.add('hidden');
}