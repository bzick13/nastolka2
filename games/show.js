import {
  state, content, timerDisplay, startBtn, closeBtn,
  rand, signalStart, signalEnd,
  showModalButtons, closeOverlay
} from '../app.js';

export const META = {
  label: 'Показывать',
  time: 60,
  points: 2,
  words: [
    'Автобус',
    'Автограф',
    'Автомобиль',
    'Аист',
    'Аквариум',
    'Аккумулятор',
    'Аллергия',
    'Антенна',
    'Аптека',
    'Арбуз',
    'Астероид',
    'Аукцион',
    'Аэробика',
    'Баскетбол',
    'Батут',
    'Бежать стометровку',
    'Бензобак',
    'Бессмертие',
    'Бессонница',
    'Беспозвоночное',
    'Библиотека',
    'Бигуди',
    'Блины',
    'Богатырь',
    'Болото',
    'Букет',
    'Бульон',
    'Бутсы',
    'Вакуум',
    'Варенье',
    'Вата',
    'Веб-камера',
    'Венчик',
    'Вентилятор',
    'Вентиляция',
    'Ветеринар',
    'Ветер с моря дул',
    'Витрина',
    'В лесу родилась елочка',
    'Водопад',
    'Вождь',
    'Волк в овечьей шкуре',
    'Волна',
    'Воск',
    'Вою на луну',
    'Гамак',
    'Гараж',
    'Генератор',
    'Гидроцикл',
    'Гильза',
    'Гирлянда',
    'Гироскутер',
    'Глина',
    'Гостиница',
    'Град',
    'Гром',
    'Гроб',
    'Грядка',
    'Джойстик',
    'Диаметр',
    'Дрессировщик',
    'Задом на перед',
    'Закладка',
    'Запонки',
    'Зубная боль',
    'Идёт бычок качается',
    'Инопланетянин',
    'Инструкция',
    'Искра',
    'Календарь',
    'Карабин',
    'Карниз',
    'Кастрюля',
    'Кактус',
    'Казнь',
    'Канцтовары',
    'Кладбище',
    'Китайская стена',
    'Клумба',
    'Колесо фортуны',
    'Колодец',
    'Кольчуга',
    'Компьютерное кресло',
    'Корень',
    'Космонавт',
    'Кот в мешке',
    'Креветка',
    'Крепость',
    'Купальник',
    'Лабубу',
    'Ленивый кот',
    'Лимузин',
    'Лотерея',
    'Лунатик',
    'Мавзолей',
    'Макароны',
    'Марка',
    'Материнская плата',
    'Матрица',
    'Медведь на ухо наступил',
    'Медуза',
    'Мебель',
    'Мертвый анархист',
    'Метель',
    'Метро',
    'Минута славы',
    'Мишень',
    'Мумия',
    'Мусоровоз',
    'Мыльный пузырь',
    'Мясорубка',
    'Надавить на совесть',
    'Назад в будущее',
    'Нас не догонят',
    'Небоскреб',
    'Неваляшка',
    'Новогодний подарок',
    'Общежитие',
    'Один в поле не воин',
    'Один дома',
    'Озеро',
    'Оркестр',
    'Официант с подносом',
    'Павлин',
    'Памятник',
    'Панцирь',
    'Пароль',
    'Парковка',
    'Паспорт',
    'Патрон',
    'Печенье',
    'Пенал',
    'Пена',
    'Пижама',
    'Пинцет',
    'Планета',
    'Плацкарт',
    'Плейлист',
    'Пломба',
    'Порог',
    'Порох',
    'Последний герой',
    'Похмелье',
    'Похороны',
    'Пристань',
    'Протез',
    'Профиль',
    'Пруд',
    'Пулевизатор',
    'Пуховик',
    'Радар',
    'Радиус',
    'Раскладушка',
    'Робот-пылесос',
    'Рецепт',
    'Саксофон',
    'Самовар',
    'Свадьба',
    'Северное сияние',
    'Скатертью дорога',
    'Скафандр',
    'Скворечник',
    'Смеситель',
    'Смеяться до слез',
    'Снеговик',
    'Созвездие',
    'Сосулька',
    'Спутник',
    'Стройка',
    'Теннис',
    'Телескоп',
    'Теплица',
    'Трафарет',
    'Туман',
    'Турникет',
    'Тысяча и одна ночь',
    'Удлинитель',
    'Фата',
    'Фейерверк',
    'Ферма',
    'Фигурное катание',
    'Фобия',
    'Фокусник',
    'Фольга',
    'Фонтан',
    'Фотосессия',
    'Хоккей',
    'Хомяк в колесе',
    'Храпеть',
    'Цилиндр',
    'Циркуль',
    'Чайная ложка',
    'Человек невидимка',
    'Черная дыра',
    'Чердак',
    'Чешуя',
    'Чучело',
    'Шезлонг',
    'Шептать',
    'Шланг',
    'Штопор',
    'Штраф',
    'Шторы',
    'Эхо',
    'Юла',
    'Якорь',
    'We will rock you'
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
    }
  }, 1000);
}