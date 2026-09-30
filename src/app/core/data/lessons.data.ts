import { Lesson } from '../models/archipelago.model';

export const INITIAL_LESSONS: Lesson[] = [
  // LEVEL 0: Visual Logic (1–4 классы, абсолютные новички)
  {
    id: 'lvl0-1-what-is-program',
    islandId: 'zero',
    level: 0,
    title: 'Урок 0.1: Що таке програма? Послідовність дій',
    objective: 'Зрозуміти фундаментальне поняття програми як точної послідовності інструкцій для виконавця.',
    prerequisites: ['Базові навички роботи з мишею та клавіатурою'],
    outcomes: [
      'Пояснювати різницю між хаотичною дією та алгоритмом',
      'Складати покрокові інструкції для виконавця (Робота)',
      'Знаходити помилки порушення черговості дій'
    ],
    theory: `Комп'ютер — це неймовірно швидка, але абсолютно буквальна машина. Він не вміє "додумувати" або здогадуватися, що ви мали на увазі.\n\nПрограма — це послідовність чітких, однозначних інструкцій, яку комп'ютер виконує крок за кроком зверху вниз.`,
    visualExplanation: `Побутовий приклад приготування чаю:
┌─────────────────────────┐
│ 1. Взяти чашку          │
│ 2. Покласти пакетик чаю │
│ 3. Налити гарячу воду   │
│ 4. Перемішати ложкою    │
└─────────────────────────┘
⚠️ Якщо переплутати кроки (наприклад, налити воду до того, як взяли чашку), станеться аварія (Bug)!`,
    codeExample: `// Алгоритм руху Робота до батарейки
function reachBattery() {
  robot.stepForward();
  robot.stepForward();
  robot.turnRight();
  robot.stepForward();
  robot.collectBattery();
}`,
    breakdown: [
      'stepForward() — команда зробити один крок уперед',
      'turnRight() — команда повернутися на 90 градусів праворуч',
      'collectBattery() — взаємодія з обʼєктом'
    ],
    stepByStep: [
      'Крок 1: Оцініть початкове положення виконавця на карті.',
      'Крок 2: Порахуйте точну кількість кроків до першого повороту.',
      'Крок 3: Вкажіть правильний напрямок повороту.',
      'Крок 4: Завершіть маршрут цільовою дією.'
    ],
    knowledgeCheck: [
      {
        id: 'q0-1',
        question: 'Що станеться, якщо робот спочатку спробує взяти предмет, а лише потім підійде до нього?',
        options: ['Він візьме його телепатично', 'Виникне помилка (предмета немає поруч)', 'Нічого не зміниться'],
        correctIndex: 1,
        explanation: 'Інструкції виконуються суворо послідовно. Робот не може взаємодіяти з предметом на відстані.',
        type: 'multiple-choice'
      },
      {
        id: 'q0-2',
        question: 'Що буде виведено після виконання цих рядків?',
        codeSnippet: `let step = 1;
step = step + 1;
console.log(step);`,
        options: ['1', '2', 'step + 1'],
        correctIndex: 1,
        explanation: 'Спочатку step дорівнює 1. Потім ми додаємо 1 і зберігаємо результат 2.',
        type: 'prediction'
      }
    ],
    starterCode: `// Напишіть функцію, яка повертає рядок 'ROBOT_READY'
function initializeRobot() {
  // Ваш код тут
}
`,
    solutionCode: `function initializeRobot() {
  return 'ROBOT_READY';
}`,
    testCases: [
      {
        id: 't0-1',
        title: 'Перевірка готовності робота',
        input: 'initializeRobot()',
        expected: 'ROBOT_READY',
        hidden: false
      },
      {
        id: 't0-2',
        title: 'Тип поверненого значення',
        input: 'typeof initializeRobot()',
        expected: 'string',
        hidden: true
      }
    ],
    oracleConcept: 'Уява: уявіть, що ви вмикаєте живлення і робот надсилає свій перший сигнал через слово return.',
    oraclePseudocode: `ФУНКЦІЯ initializeRobot:
  ПОВЕРНУТИ текстовий рядок "ROBOT_READY"`,
    oracleSolution: `function initializeRobot() {\n  return 'ROBOT_READY';\n}`,
    challenge: 'Додайте передачу параметра імені робота, щоб отримати "ROBOT_ALEX_READY".',
    miniProject: 'Robot Adventure: рух робота лабіринтом за сіткою 5x5.',
    status: 'learning',
    masteryScore: 85,
    hintLevelUsed: 0
  },

  // LEVEL 0.4: Loops
  {
    id: 'lvl0-4-loops-visual',
    islandId: 'zero',
    level: 0,
    title: 'Урок 0.4: Цикли — Сила багаторазового повторення',
    objective: 'Замінити довгий повторюваний код компактним циклом.',
    prerequisites: ['Урок 0.1: Послідовність'],
    outcomes: ['Розуміти навіщо потрібні цикли', 'Вміти писати базовий цикл for', 'Уникати нескінченних циклів'],
    theory: `Замість того, щоб 5 разів писати robot.stepForward(), програміст використовує цикл.\nЦикл — це команда комп'ютеру повторювати блок інструкцій певну кількість разів або доки виконується умова.`,
    visualExplanation: `Звичайний код:
MOVE ➔ MOVE ➔ MOVE ➔ MOVE ➔ MOVE

З циклом:
REPEAT 5 TIMES:
  └── MOVE`,
    codeExample: `function repeatWalk(steps) {
  let log = [];
  for (let i = 0; i < steps; i++) {
    log.push("step");
  }
  return log.length;
}`,
    breakdown: [
      'let i = 0 — лічильник стартує з нуля',
      'i < steps — умова продовження циклу',
      'i++ — збільшення лічильника на 1 після кожного кроку'
    ],
    stepByStep: [
      'Визначте дію, яку потрібно повторювати',
      'Вкажіть лічильник циклу',
      'Переконайтеся, що умова колись стане хибною, інакше програма зависне'
    ],
    knowledgeCheck: [
      {
        id: 'q0-4-1',
        question: 'Скільки разів виконається цикл: for(let i = 0; i < 3; i++) ?',
        options: ['2 рази', '3 рази', '4 рази'],
        correctIndex: 1,
        explanation: 'Значення i будуть: 0, 1, 2. Тобто рівно 3 рази.',
        type: 'multiple-choice'
      }
    ],
    starterCode: `// Поверніть суму чисел від 1 до N за допомогою циклу
function sumUpTo(n) {
  // Напишіть цикл тут
}
`,
    solutionCode: `function sumUpTo(n) {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total += i;
  }
  return total;
}`,
    testCases: [
      { id: 't0-4-1', title: 'Сума до 3', input: 'sumUpTo(3)', expected: '6', hidden: false },
      { id: 't0-4-2', title: 'Сума до 5', input: 'sumUpTo(5)', expected: '15', hidden: false },
      { id: 't0-4-3', title: 'Сума до 10 (hidden)', input: 'sumUpTo(10)', expected: '55', hidden: true }
    ],
    oracleConcept: 'Створіть змінну-скриньку total = 0 і в циклі додавайте до неї кожне поточне число i.',
    oraclePseudocode: `let total = 0
ЦИКЛ від i = 1 до n:
  total = total + i
ПОВЕРНУТИ total`,
    oracleSolution: `function sumUpTo(n) {\n  let total = 0;\n  for (let i = 1; i <= n; i++) {\n    total += i;\n  }\n  return total;\n}`,
    challenge: 'Знайдіть суму лише парних чисел за допомогою перевірки i % 2 === 0.',
    miniProject: 'Автоматичний лічильник ресурсів на острові.',
    status: 'not-started',
    masteryScore: 0,
    hintLevelUsed: 0
  },

  // LEVEL 1: Foundations (Python / JS)
  {
    id: 'lvl1-variables-basics',
    islandId: 'javascript',
    level: 1,
    title: 'Урок 1.1: Змінні та Типи даних (let, const, number, string)',
    objective: 'Опанувати оголошення змінних, типи даних Number, String, Boolean та прості операції.',
    prerequisites: ['Level 0'],
    outcomes: ['Використовувати let та const коректно', 'Розрізняти типи даних', 'Працювати з рядками та числами'],
    theory: `Змінна — це іменована комірка в оперативній пам'яті комп'ютера, призначена для зберігання даних.\nУ сучасному JavaScript ми використовуємо:
- const: для значень, які не змінюються
- let: для значень, які можуть перезаписуватися`,
    visualExplanation: `Пам'ять комп'ютера:
┌────────────────────────┐
│ let score = 100;       │ ➔ [Комірка 'score'] = 100
│ const playerName = "A";│ ➔ [Комірка 'playerName'] = "A" (замок 🔒)
└────────────────────────┘`,
    codeExample: `let score = 0;
score = score + 50;
const status = "playing";
console.log(score, status); // 50, playing`,
    breakdown: [
      'let створює змінну, якій можна присвоїти нове значення',
      'const гарантує незмінність посилання',
      'Оператор = це присвоєння (а не математична рівність)'
    ],
    stepByStep: [
      'Оголосіть змінну за допомогою let або const',
      'Дайте їй інформативне імʼя в camelCase (наприклад, userScore)',
      'Присвойте початкове значення через знак ='
    ],
    knowledgeCheck: [
      {
        id: 'q1-1',
        question: 'Що трапиться, якщо спробувати змінити змінну, створену через const?',
        options: ['Вона зміниться', 'Виникне TypeError: Assignment to constant variable', 'Вона стане undefined'],
        correctIndex: 1,
        explanation: 'const забороняє повторне присвоєння значення цій змінній.',
        type: 'multiple-choice'
      },
      {
        id: 'q1-2',
        question: 'Виправте код, щоб функція коректно повертала суму двох чисел:',
        codeSnippet: `function sum(a, b) {\n  return a - b;\n}`,
        options: ['return a + b;', 'return a * b;', 'return a / b;'],
        correctIndex: 0,
        explanation: 'Замість оператора віднімання (-) необхідно застосувати додавання (+).',
        type: 'fix-code'
      }
    ],
    starterCode: `// Реалізуйте функцію calculateTotal(price, taxRate)
// Вона має повернути підсумкову суму: ціна + податок (price * taxRate)
function calculateTotal(price, taxRate) {
  // Напишіть розрахунок
}
`,
    solutionCode: `function calculateTotal(price, taxRate) {
  const tax = price * taxRate;
  return price + tax;
}`,
    testCases: [
      { id: 't1-1', title: '100 з податком 0.2', input: 'calculateTotal(100, 0.2)', expected: '120', hidden: false },
      { id: 't1-2', title: '50 без податку', input: 'calculateTotal(50, 0)', expected: '50', hidden: false },
      { id: 't1-3', title: '200 з податком 0.15 (hidden)', input: 'calculateTotal(200, 0.15)', expected: '230', hidden: true }
    ],
    oracleConcept: 'Податок обчислюється множенням ціни на ставку. Підсумкова сума — це додавання податку до початкової ціни.',
    oraclePseudocode: `ФУНКЦІЯ calculateTotal(price, taxRate):
  tax = price * taxRate
  ПОВЕРНУТИ price + tax`,
    oracleSolution: `function calculateTotal(price, taxRate) {\n  return price + (price * taxRate);\n}`,
    challenge: 'Округліть результат до двох знаків після коми за допомогою Math.round або toFixed.',
    miniProject: 'Treasure Game: інвентар героя та нарахування золота за перемогу.',
    status: 'practicing',
    masteryScore: 70,
    hintLevelUsed: 1
  },

  // LEVEL 2: Arrays, Objects & Debugging
  {
    id: 'lvl2-arrays-objects',
    islandId: 'javascript',
    level: 2,
    title: 'Урок 2.1: Масиви та Обʼєкти — Структурування інформації',
    objective: 'Навчитися групувати дані у списки (Arrays) та складні сутності з властивостями (Objects).',
    prerequisites: ['Level 1'],
    outcomes: ['Маніпулювати масивами: filter, map, push', 'Працювати з властивостями обʼєктів', 'Обробляти помилки з try/catch'],
    theory: `Масив — це впорядкована колекція елементів, доступ до яких здійснюється за числовим індексом (з 0).\nОбʼєкт — це набір пар "ключ-значення", що моделює реальну сутність (наприклад, банківську транзакцію або профіль користувача).`,
    visualExplanation: `Масив транзакцій:
[
  { id: 1, amount: 250, type: "income" },
  { id: 2, amount: 80,  type: "expense" }
]
Кожен об'єкт містить детальні характеристики транзакції.`,
    codeExample: `const transactions = [
  { amount: 100, type: 'income' },
  { amount: 40, type: 'expense' }
];

const totalBalance = transactions.reduce((acc, t) => {
  return t.type === 'income' ? acc + t.amount : acc - t.amount;
}, 0); // 60`,
    breakdown: [
      'reduce() послідовно акумулює баланс',
      'тернарний оператор перевіряє тип операції',
      'початкове значення балансу передається як 0'
    ],
    stepByStep: [
      'Створіть масив з початковими записами',
      'Використайте метод масиву для обробки кожного елемента',
      'Поверніть результат розрахунку'
    ],
    knowledgeCheck: [
      {
        id: 'q2-1',
        question: 'Який індекс має перший елемент масиву у більшості мов (JS, Python, C++)?',
        options: ['0', '1', '-1'],
        correctIndex: 0,
        explanation: 'Усі ці мови використовують нульову індексацію.',
        type: 'multiple-choice'
      }
    ],
    starterCode: `// Реалізуйте функцію getExpenseTotal(transactions)
// Вона має повернути загальну суму лише тих транзакцій, де type === 'expense'
function getExpenseTotal(transactions) {
  // Напишіть підрахунок витрат
}
`,
    solutionCode: `function getExpenseTotal(transactions) {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}`,
    testCases: [
      {
        id: 't2-1',
        title: 'Фільтрація витрат',
        input: 'getExpenseTotal([{ amount: 100, type: "expense" }, { amount: 50, type: "income" }, { amount: 30, type: "expense" }])',
        expected: '130',
        hidden: false
      },
      {
        id: 't2-2',
        title: 'Порожній список витрат',
        input: 'getExpenseTotal([{ amount: 200, type: "income" }])',
        expected: '0',
        hidden: false
      }
    ],
    oracleConcept: 'Відфільтруйте масив за умовою t.type === "expense" або пройдіть його циклом, додаючи amount до sum.',
    oraclePseudocode: `total = 0
ДЛЯ КОЖНОЇ транзакції t В transactions:
  ЯКЩО t.type === 'expense':
    total = total + t.amount
ПОВЕРНУТИ total`,
    oracleSolution: `function getExpenseTotal(transactions) {\n  let total = 0;\n  for (const t of transactions) {\n    if (t.type === 'expense') total += t.amount;\n  }\n  return total;\n}`,
    challenge: 'Додайте групування витрат за категоріями (їжа, транспорт, розваги).',
    miniProject: 'Personal Finance Tracker: особистий бюджет з графіком.',
    status: 'not-started',
    masteryScore: 0,
    hintLevelUsed: 0
  },

  // LEVEL 5: Algorithms & Complexity
  {
    id: 'lvl5-algorithms-big-o',
    islandId: 'cpp',
    level: 5,
    title: 'Урок 5.1: Алгоритми, Бінарний пошук та Оцінка складності O(log N)',
    objective: 'Зрозуміти асимптотичний аналіз Big-O та реалізувати класичний Binary Search.',
    prerequisites: ['Level 4', 'Масиви та показники'],
    outcomes: [
      'Аналізувати часову та просторову складність O(1), O(log N), O(N), O(N²)',
      'Реалізувати бінарний пошук у відсортованому масиві',
      'Запобігати зацикленням та переповненням індексів'
    ],
    theory: `Асимптотична складність (Big-O notation) показує, як зростає час роботи або споживання пам'яті алгоритму зі збільшенням розміру вхідних даних N.\n\nЛінійний пошук перевіряє кожен елемент поспіль ➔ O(N).\nБінарний пошук щокроку ділить відсортований простір навпіл ➔ O(log N). Для 1 000 000 елементів потрібно всього ~20 операцій!`,
    visualExplanation: `Відсортований масив: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
Шукаємо: 23
Крок 1: Середина = 16 (23 > 16) ➔ Відкидаємо ліву половину!
Крок 2: Новий діапазон [23, 38, 56, 72, 91], середина = 56 (23 < 56) ➔ Відкидаємо праву!
Крок 3: Середина = 23. Знайдено за 3 кроки замість 6!`,
    codeExample: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    breakdown: [
      'left і right — вказівники на межі пошукового вікна',
      'mid обчислюється як цілочисельна середина',
      'якщо значення не знайдено, повертається -1'
    ],
    stepByStep: [
      'Переконайтеся, що вхідний масив відсортований',
      'Ініціалізуйте лівий та правий покажчики',
      'У циклі while (left <= right) обчислюйте mid та звужуйте межі'
    ],
    knowledgeCheck: [
      {
        id: 'q5-1',
        question: 'Скільки максимум порівнянь потрібно для пошуку в масиві з 1024 елементів за допомогою Binary Search?',
        options: ['10', '1024', '512'],
        correctIndex: 0,
        explanation: '2^10 = 1024, отже log2(1024) = 10 порівнянь!',
        type: 'multiple-choice'
      }
    ],
    starterCode: `// Реалізуйте бінарний пошук. Поверніть індекс або -1
function findElementBinary(sortedArray, target) {
  // Напишіть бінарний пошук O(log N)
}
`,
    solutionCode: `function findElementBinary(sortedArray, target) {
  let left = 0;
  let right = sortedArray.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (sortedArray[mid] === target) return mid;
    if (sortedArray[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}`,
    testCases: [
      { id: 't5-1', title: 'Елемент посередині', input: 'findElementBinary([1, 3, 5, 7, 9], 5)', expected: '2', hidden: false },
      { id: 't5-2', title: 'Елемент відсутній', input: 'findElementBinary([2, 4, 6, 8], 5)', expected: '-1', hidden: false },
      { id: 't5-3', title: 'Великий масив (hidden)', input: 'findElementBinary([10, 20, 30, 40, 50, 60, 70, 80], 70)', expected: '6', hidden: true }
    ],
    oracleConcept: 'Бінарний пошук працює за принципом відгадування задуманого числа: питаємо середину і кажемо "більше" чи "менше".',
    oraclePseudocode: `left = 0, right = довжина - 1
ПОКИ left <= right:
  mid = (left + right) / 2
  ЯКЩО arr[mid] == target: ПОВЕРНУТИ mid
  ЯКЩО arr[mid] < target: left = mid + 1
  ІНАКШЕ: right = mid - 1
ПОВЕРНУТИ -1`,
    oracleSolution: `function findElementBinary(sortedArray, target) {\n  let left = 0, right = sortedArray.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (sortedArray[mid] === target) return mid;\n    if (sortedArray[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}`,
    challenge: 'Модифікуйте пошук, щоб знайти перше входження дубліката (lower bound).',
    miniProject: 'Algorithm Lab: візуалізатор та бенчмарк сортувань (Quick, Merge, Heap).',
    status: 'not-started',
    masteryScore: 0,
    hintLevelUsed: 0
  },

  // LEVEL 7: Systems Engineering (OS, Memory, Concurrency)
  {
    id: 'lvl7-concurrency-mutex',
    islandId: 'rust',
    level: 7,
    title: 'Урок 7.1: Системна інженерія — Потоки, Стан перегонів (Race Condition) та Mutex',
    objective: 'Розуміти як працюють потоки ОС, розділювана памʼять та блокування синхронізації.',
    prerequisites: ['Level 6', 'Стек та Купа'],
    outcomes: ['Розуміти природу Race Condition', 'Застосовувати мʼютекси для критичних секцій', 'Уникати взаємних блокувань (Deadlock)'],
    theory: `Коли кілька потоків одночасно читають і записують в одну й ту ж комірку пам'яті без синхронізації, виникає стан перегонів (Race Condition).\nMutex (Mutual Exclusion) гарантує, що в критичну секцію коду в будь-який момент часу може зайти ТІЛЬКИ ОДИН потік. Решта чекає у черзі.`,
    visualExplanation: `Потік 1 ──┐
          ├── 🔒 MUTEX [Критична секція: баланс += 100] ➔ Розблоковано
Потік 2 ──┘ (чекає звільнення замка)`,
    codeExample: `// Концепція атомарного лічильника з захистом
class SafeCounter {
  constructor() {
    this.value = 0;
    this.locked = false;
  }
  increment() {
    // В реальній системі це виконується за допомогою атомарних інструкцій процесора (CAS)
    this.value += 1;
    return this.value;
  }
}`,
    breakdown: [
      'Критична секція — частина коду, що модифікує спільний ресурс',
      'Deadlock виникає, коли два потоки блокують ресурси один одного'
    ],
    stepByStep: [
      'Визначте спільний змінюваний ресурс',
      'Захистіть його блокуванням перед записом',
      'Обовʼязково звільніть блокування навіть при помилці'
    ],
    knowledgeCheck: [
      {
        id: 'q7-1',
        question: 'Що таке Deadlock?',
        options: [
          'Ситуація, коли потоки нескінченно чекають на ресурси, захоплені один одним',
          'Звичайна зупинка програми після завершення',
          'Помилка компіляції в C++'
        ],
        correctIndex: 0,
        explanation: 'Взаємне блокування зупиняє систему, оскільки жоден потік не може рухатися далі.',
        type: 'multiple-choice'
      }
    ],
    starterCode: `// Реалізуйте симулятор черги завдань з обмеженням одночасних воркерів
function simulateJobQueue(tasksCount, maxWorkers) {
  // Поверніть кількість батчів, необхідних для виконання всіх завдань
}
`,
    solutionCode: `function simulateJobQueue(tasksCount, maxWorkers) {
  if (tasksCount <= 0 || maxWorkers <= 0) return 0;
  return Math.ceil(tasksCount / maxWorkers);
}`,
    testCases: [
      { id: 't7-1', title: '10 завдань на 3 воркери', input: 'simulateJobQueue(10, 3)', expected: '4', hidden: false },
      { id: 't7-2', title: '5 завдань на 5 воркерів', input: 'simulateJobQueue(5, 5)', expected: '1', hidden: false }
    ],
    oracleConcept: 'Кількість батчів дорівнює округленню вгору ділення tasksCount на maxWorkers за допомогою Math.ceil.',
    oraclePseudocode: `ФУНКЦІЯ simulateJobQueue(tasksCount, maxWorkers):
  ЯКЩО tasksCount <= 0: ПОВЕРНУТИ 0
  ПОВЕРНУТИ стеля(tasksCount / maxWorkers)`,
    oracleSolution: `function simulateJobQueue(tasksCount, maxWorkers) {\n  return Math.ceil(tasksCount / maxWorkers);\n}`,
    challenge: 'Додайте розрахунок часу очікування в черзі з урахуванням часу виконання кожного завдання.',
    miniProject: 'Distributed Job System: розподілена черга повідомлень з retry та ідемпотентністю.',
    status: 'not-started',
    masteryScore: 0,
    hintLevelUsed: 0
  }
];
