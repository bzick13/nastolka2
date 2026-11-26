import { rand } from '../app.js';

export const HARD_MODES = {
  draw: [
    { text: 'Рисовать другой рукой.', time: null },
    { text: 'Рисовать только прямые линии.', time: null },
    { text: 'Время ограничено 60 сек.', time: 60 }
  ],
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
  ]
};

export function showHardMode(currentGame) {
  const gameKey = currentGame.key;
  const modes = HARD_MODES[gameKey] || [{ text: 'Усложнение не задано.', time: null }];
  const randomMode = rand(modes);

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

  document.getElementById('hard-text').textContent = randomMode.text;
  hardOverlay.classList.remove('hidden');

  // Обработчик кнопки "Старт"
  document.getElementById('hard-start-btn').onclick = () => {
    hardOverlay.classList.add('hidden');
    
    // Сохраняем усложнение
    currentGame.hardMode = randomMode;

    // Если есть новое время, меняем его
    if (randomMode.time !== null) {
      currentGame.meta.time = randomMode.time;
    }

    // Просто отправляем событие, что пора стартовать, и передаем игру
    window.dispatchEvent(new CustomEvent('startHardMode', { detail: currentGame }));
  };

  // Обработчик кнопки "Отмена"
  document.getElementById('hard-cancel-btn').onclick = () => {
    hardOverlay.classList.add('hidden');
  };
}