import {
  state, content, timerDisplay, startBtn, closeBtn,
  drawOverlay, drawTimer, canvas,
  rand, signalStart, signalEnd,
  showModalButtons, closeOverlay
} from '../app.js';

export const META = {
  label: 'Рисовать',
  time: 90,
  points: 2,
  words: [
    'Баранка', 'Батарейка', 'Божья коровка', 'Браслет', 'Булавка', 'Ваза с цветами',
    'Ведьма', 'Верёвочная лестница', 'Вирус', 'Влажные салфетки', 'Воздушный змей',
    'Глобус', 'Горизонт', 'Град', 'Грустный клоун', 'Грустный огурец', 'Губка',
    'Дворник', 'Двухъярусная кровать', 'Доспехи', 'Духи', 'Душа', 'Дым', 'Дырокол',
    'Жалюзи', 'Жара', 'Жертвоприношение', 'Замочная скважина', 'Зарядное устройство',
    'Золушка', 'Зубная паста', 'Иллюминатор', 'Калейдоскоп', 'Клизма',
    'Клубничное варенье', 'Клубок ниток', 'Ковер', 'Коготь', 'Колба', 'Комикс',
    'Компас', 'Корзина для белья', 'Корка арбуза', 'Кот в мешке', 'Кресло-качалка',
    'Кривое зеркало', 'Кубик Рубика', 'Кусок пиццы', 'Леденец', 'Листопад',
    'Лобовое стекло', 'Лоджия', 'Лягушка', 'Маяк', 'Маракас', 'Медицинская маска',
    'Микроскоп', 'Молитва', 'Мольберт', 'Мухомор', 'Мыльный пузырь', 'Наволочка',
    'Надувной матрас', 'Напёрсток', 'Настольная лампа', 'Обруч', 'Ограбление банка',
    'Оригами', 'Отражение', 'Парус', 'Пачка чипсов', 'Пицца с ананасами', 'Поводок',
    'Погоны', 'Подушка безопасности', 'Подсвечник', 'Подтягивание', 'Половник',
    'Поплавок', 'Почтовый ящик', 'Прикроватная тумбочка', 'Прищепка', 'Пробка',
    'Проектор', 'Разбитое зеркало', 'Раскладушка', 'Ремень безопасности', 'Сито',
    'Скрипка', 'Складной нож', 'Складной стул', 'Сломанный зонт', 'Собачья будка',
    'Солнечное затмение', 'Солнечный зайчик', 'Солнечный луч', 'Сопля',
    'Сосиска в тесте', 'Таблица Менделеева', 'Телепортация', 'Тёрка', 'Термометр',
    'Тир', 'Токсичность', 'Точилка', 'Транспортир', 'Туалетная бумага',
    'Угловой диван', 'Уголь', 'Улей', 'Фокусник', 'Форточка', 'Фотобудка',
    'Фотозона', 'Хлопушка', 'Часы с кукушкой', 'Чашка чая', 'Черепаха',
    'Черная кошка', 'Шампунь', 'Штурвал', 'Щеколда'
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
    // Если первое слово в новой колоде совпадает с последним из прошлой — меняем местами
    if (wordDeck[0] === lastWord && wordDeck.length > 1) {
      [wordDeck[0], wordDeck[1]] = [wordDeck[1], wordDeck[0]];
    }
  }
  const word = wordDeck.pop();
  lastWord = word;
  return word;
}
// ======================================

let ctx = null;
let eraserMode = false;
let isLineMode = false;
let drawing = false;
let currentColor = '#000000';

// Переменные для истории и линий
let undoStack = [];
let redoStack = [];
let startPos = null;
let snapshot = null;

const clearBtn = document.getElementById('clear-btn');
const eraserBtn = document.getElementById('eraser-btn');
const doneBtn = document.getElementById('done-btn');
const colorPickerBtn = document.getElementById('color-picker-btn');
const colorIndicator = document.getElementById('current-color-indicator');
const colorModal = document.getElementById('color-modal');
const closeColorModalBtn = document.getElementById('close-color-modal');
const colorBtns = document.querySelectorAll('.color-btn');

// Кнопки отмены/возврата/инструментов
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const freehandBtn = document.getElementById('freehand-btn');
const lineBtn = document.getElementById('line-btn');

/* Открытие */
export function open(currentGame) {
  currentGame.currentWord = getNextWord(); // <-- ИЗМЕНЕНО

  content.innerHTML = `
    <div class="word">${currentGame.currentWord}</div>
    <div class="points">Баллы: ${META.points}</div>
  `;
  timerDisplay.classList.remove('hidden');
  timerDisplay.innerHTML = `<span class="timer-label">Время:</span> ${META.time}`;
  showModalButtons();
  startBtn.classList.remove('hidden');
  startBtn.onclick = () => start(currentGame);
  closeBtn.onclick = closeOverlay;
}

/* Старт */
function start(currentGame) {
  if (state.isRunning) return;
  state.isRunning = true;
  startBtn.classList.add('hidden');

  removeDrawingListeners();

  drawOverlay.classList.remove('hidden');
  colorModal.classList.add('hidden');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';

  ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  eraserMode = false;
  drawing = false;
  currentColor = '#000000';

  // --- ПРОВЕРКА УСЛОЖНЕНИЙ ---
  const isNoEraser = currentGame.hardMode && currentGame.hardMode.text === 'Запрещено использовать кнопку стирания.';
  const isLinesOnly = currentGame.hardMode && currentGame.hardMode.linesOnly;

  if (isNoEraser) {
    clearBtn.style.display = 'none';
    eraserBtn.style.display = 'none';
  } else {
    clearBtn.style.display = '';
    eraserBtn.style.display = '';
  }

  if (isLinesOnly) {
    isLineMode = true;
    if (lineBtn) lineBtn.classList.add('active');
    if (freehandBtn) {
      freehandBtn.classList.remove('active');
      freehandBtn.disabled = true;
      freehandBtn.style.opacity = '0.4';
    }
  } else {
    isLineMode = false;
    if (lineBtn) lineBtn.classList.remove('active');
    if (freehandBtn) {
      freehandBtn.classList.add('active');
      freehandBtn.disabled = false;
      freehandBtn.style.opacity = '1';
    }
  }
  // ---------------------------

  eraserBtn.classList.remove('active');
  undoStack = [];
  redoStack = [];

  if (colorIndicator) colorIndicator.style.backgroundColor = currentColor;

  colorBtns.forEach(btn => btn.classList.remove('active'));
  if(colorBtns[0]) colorBtns[0].classList.add('active');

  applyBrush();

  clearBtn.addEventListener('click', onClear);
  eraserBtn.addEventListener('click', onToggleEraser);
  doneBtn.addEventListener('click', onDone);
  colorPickerBtn.addEventListener('click', onOpenColorModal);
  closeColorModalBtn.addEventListener('click', onCloseColorModal);

  if (undoBtn) undoBtn.addEventListener('click', onUndo);
  if (redoBtn) redoBtn.addEventListener('click', onRedo);
  if (freehandBtn) freehandBtn.addEventListener('click', onSelectFreehand);
  if (lineBtn) lineBtn.addEventListener('click', onSelectLine);

  colorBtns.forEach(btn => {
    btn.addEventListener('click', onColorChange);
  });

  let count = 3;
  drawTimer.textContent = '3';
  drawTimer.style.color = '#1565c0';

  state.countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      drawTimer.textContent = `${count}`;
    } else if (count === 0) {
      drawTimer.textContent = 'Старт!';
      signalStart();
    } else {
      clearInterval(state.countdownInterval);
      state.countdownInterval = null;
      enableDrawing();
      startDrawTimer(currentGame);
    }
  }, 1000);
}

function applyBrush() {
  if (!ctx) return;
  if (eraserMode) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 30;
  } else {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 4;
  }
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function startDrawTimer(currentGame) {
  let left = META.time;
  drawTimer.textContent = left;
  drawTimer.style.color = '#c62828';

  state.timerInterval = setInterval(() => {
    left--;
    drawTimer.textContent = left;
    if (left <= 0) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
      signalEnd();
      endRound(currentGame);
    }
  }, 1000);
}

/* Завершение раунда */
function endRound(currentGame) {
  clearInterval(state.timerInterval);
  clearInterval(state.countdownInterval);
  state.timerInterval = null;
  state.countdownInterval = null;

  drawing = false;
  if (ctx) ctx.beginPath();

  removeDrawingListeners();
  colorModal.classList.add('hidden');

  drawOverlay.classList.add('hidden');
  state.isRunning = false;

  content.innerHTML = `
    <div class="word">${currentGame.currentWord}</div>
    <div class="points">Баллы: ${META.points}</div>
  `;
  timerDisplay.innerHTML = `<span class="timer-label">Время:</span> 0`;
  timerDisplay.classList.remove('hidden');
  showModalButtons();
  startBtn.classList.add('hidden');
  closeBtn.onclick = closeOverlay;
}

/* ============ РИСОВАНИЕ ============ */
function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const t = e.touches && e.touches.length ? e.touches[0] : e;

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (t.clientX - rect.left) * scaleX,
    y: (t.clientY - rect.top) * scaleY
  };
}

function saveHistory() {
  if (undoStack.length > 20) undoStack.shift();
  undoStack.push(canvas.toDataURL());
  redoStack = [];
}

function restoreHistory(dataUrl) {
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    applyBrush();
  };
  img.src = dataUrl;
}

function onStart(e) {
  if (!ctx || !state.isRunning) return;
  e.preventDefault();

  saveHistory();

  drawing = true;
  startPos = getPos(e);

  if (isLineMode) {
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  } else {
    ctx.beginPath();
    ctx.moveTo(startPos.x, startPos.y);
    ctx.lineTo(startPos.x + 0.1, startPos.y + 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(startPos.x, startPos.y);
  }
}

function onMove(e) {
  if (!drawing || !ctx || !state.isRunning) return;
  e.preventDefault();
  const p = getPos(e);

  if (isLineMode) {
    if (!snapshot) return;
    ctx.putImageData(snapshot, 0, 0);
    ctx.beginPath();
    ctx.moveTo(startPos.x, startPos.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  } else {
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
}

function onEnd(e) {
  if (!drawing) return;
  drawing = false;

  if (isLineMode) {
    snapshot = null;
  } else {
    if (ctx) ctx.beginPath();
  }
}

function onClear(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  if (!ctx) return;
  saveHistory();
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  applyBrush();
}

function onUndo(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  if (undoStack.length === 0) return;

  const currentState = canvas.toDataURL();
  redoStack.push(currentState);

  const previousState = undoStack.pop();
  restoreHistory(previousState);
}

function onRedo(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  if (redoStack.length === 0) return;

  const currentState = canvas.toDataURL();
  undoStack.push(currentState);

  const nextState = redoStack.pop();
  restoreHistory(nextState);
}

function onToggleEraser(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  eraserMode = !eraserMode;
  eraserBtn.classList.toggle('active', eraserMode);

  if (eraserMode) {
    colorBtns.forEach(btn => btn.classList.remove('active'));
  } else {
    colorBtns.forEach(btn => {
      if (btn.dataset.color === currentColor) btn.classList.add('active');
    });
  }

  applyBrush();
}

function onSelectFreehand(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  isLineMode = false;
  if (lineBtn) lineBtn.classList.remove('active');
  if (freehandBtn) freehandBtn.classList.add('active');
}

function onSelectLine(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  isLineMode = true;
  if (freehandBtn) freehandBtn.classList.remove('active');
  if (lineBtn) lineBtn.classList.add('active');
}

/* ============ ПАЛИТРА ============ */
function onOpenColorModal(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  colorModal.classList.remove('hidden');
}

function onCloseColorModal(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  colorModal.classList.add('hidden');
}

function onColorChange(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  const btn = e.currentTarget;
  currentColor = btn.dataset.color;

  eraserMode = false;
  eraserBtn.classList.remove('active');

  colorBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  if (colorIndicator) colorIndicator.style.backgroundColor = currentColor;

  applyBrush();
  colorModal.classList.add('hidden');
}

/* Готово */
function onDone(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  if (!state.isRunning) return;
  if (!state.currentGame) return;

  drawing = false;
  if (ctx) ctx.beginPath();

  endRound(state.currentGame);
}

function enableDrawing() {
  drawing = false;

  canvas.addEventListener('mousedown', onStart);
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseup', onEnd);
  canvas.addEventListener('mouseleave', onEnd);
  canvas.addEventListener('touchstart', onStart, { passive: false });
  canvas.addEventListener('touchmove', onMove, { passive: false });
  canvas.addEventListener('touchend', onEnd);
  canvas.addEventListener('touchcancel', onEnd);
}

export function cleanup() {
  removeDrawingListeners();
  colorModal.classList.add('hidden');

  // Восстанавливаем кнопки, если они были скрыты усложнением
  clearBtn.style.display = '';
  eraserBtn.style.display = '';
  if (freehandBtn) {
    freehandBtn.disabled = false;
    freehandBtn.style.opacity = '1';
  }
}

function removeDrawingListeners() {
  canvas.removeEventListener('mousedown', onStart);
  canvas.removeEventListener('mousemove', onMove);
  canvas.removeEventListener('mouseup', onEnd);
  canvas.removeEventListener('mouseleave', onEnd);
  canvas.removeEventListener('touchstart', onStart);
  canvas.removeEventListener('touchmove', onMove);
  canvas.removeEventListener('touchend', onEnd);
  canvas.removeEventListener('touchcancel', onEnd);

  clearBtn.removeEventListener('click', onClear);
  eraserBtn.removeEventListener('click', onToggleEraser);
  doneBtn.removeEventListener('click', onDone);
  colorPickerBtn.removeEventListener('click', onOpenColorModal);
  closeColorModalBtn.removeEventListener('click', onCloseColorModal);

  if (undoBtn) undoBtn.removeEventListener('click', onUndo);
  if (redoBtn) redoBtn.removeEventListener('click', onRedo);
  if (freehandBtn) freehandBtn.removeEventListener('click', onSelectFreehand);
  if (lineBtn) lineBtn.removeEventListener('click', onSelectLine);

  colorBtns.forEach(btn => {
    btn.removeEventListener('click', onColorChange);
  });

  drawing = false;
}

/* resize */
window.addEventListener('resize', () => {
  if (drawOverlay.classList.contains('hidden') || !ctx) return;

  const oldW = canvas.width;
  const oldH = canvas.height;
  const temp = document.createElement('canvas');
  temp.width = oldW;
  temp.height = oldH;
  temp.getContext('2d').drawImage(canvas, 0, 0);

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';

  ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(temp, 0, 0, oldW, oldH);
  applyBrush();

  undoStack = [];
  redoStack = [];
});