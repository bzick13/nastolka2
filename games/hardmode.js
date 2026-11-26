import { rand } from '../app.js';

// Список усложнений для каждой игры
export const HARD_MODES = {
  draw: [
    { text: 'Рисовать другой рукой.', time: null },
    { text: 'Рисовать только прямые линии.', time: null },
    { text: 'Время ограничено 60 сек.', time: 60 }
  ],
  // Для остальных игр (пока заглушки, тексты можно менять)
  speak: [
    { text: 'Говорить только шепотом.', time: null },
    { text: 'Нельзя использовать глаголы.', time: null }
  ],
  show: [
    { text: 'Показывать спиной к команде.', time: null },
    { text: 'Показывать только одной рукой.', time: null }
  ],
  reverse: [
    { text: 'Читать слово только один раз.', time: null },
    { text: 'Читать слово задом наперед.', time: null }
  ],
  yesno: [
    { text: 'Отвечать только жестами.', time: null },
    { text: 'Нельзя улыбаться.', time: null }
  ],
  shakoblokun: [
    { text: 'Таймер уменьшен до 30 секунд.', time: 30 },
    { text: 'Запрещено использовать кнопку стирания.', time: null }
  ],
  blitz: [
    { text: 'Нужно угадать на 2 слова больше.', time: null }
  ]
};

export function showHardMode(currentGame) {
  const gameKey = currentGame.key;
  // Берем список усложнений для текущей игры (или заглушку, если игры нет в списке)
  const modes = HARD_MODES[gameKey] || [{ text: 'Усложнение не задано.', time: null }];
  const randomMode = rand(modes);

  // Создаем окно усложнения, если его еще нет в DOM
  let hardOverlay = document.getElementById('hard-overlay');
  if (!hardOverlay) {
    hardOverlay = document.createElement('div');
    hardOverlay.id = 'hard-overlay';
    hardOverlay.className = 'hidden';
    hardOverlay.innerHTML = `
      <div class="hard-modal">
        <h2>💩 Усложнение</h2>
        <p id="hard-text"></p>
        <button id="hard-start-btn" class="btn green">Старт</button>
        <button id="hard-cancel-btn" class="btn red" style="margin-top: 10px;">Отмена</button>
      </div>
    `;
    document.body.appendChild(hardOverlay);
  }

  // Вставляем текст случайного усложнения
  document.getElementById('hard-text').textContent = randomMode.text;
  hardOverlay.classList.remove('hidden');

  // Обработчик кнопки "Старт" в окне усложнения
  document.getElementById('hard-start-btn').onclick = () => {
    hardOverlay.classList.add('hidden');

    // Сохраняем выбранное усложнение в текущую игру
    currentGame.hardMode = randomMode;

    // Если у усложнения есть новое время, перезаписываем META игры
    if (randomMode.time !== null) {
      currentGame.meta.time = randomMode.time;
    }

    // Закрываем основное окно с правилами
    document.getElementById('overlay').classList.add('hidden');

    // Отправляем событие в app.js, чтобы он запустил игру
    window.dispatchEvent(new CustomEvent('startHardMode', { detail: currentGame }));
  };

  // Обработчик кнопки "Отмена"
  document.getElementById('hard-cancel-btn').onclick = () => {
    hardOverlay.classList.add('hidden');
  };
}