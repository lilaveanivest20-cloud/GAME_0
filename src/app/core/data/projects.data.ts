import { FinalProject } from '../models/archipelago.model';

export const FINAL_PROJECTS_DATA: FinalProject[] = [
  {
    level: 0,
    title: 'Robot Adventure',
    description: 'Керуйте автономним дослідником за допомогою алгоритмів послідовності, розгалужень та циклів.',
    language: 'visual-block',
    requirements: [
      'Зібрати всі енергетичні батарейки на сітці 5x5',
      'Оминути камʼяні перешкоди',
      'Використати цикл repeat(N) для прямих дистанцій',
      'Застосувати умову "if (battery_detected)"'
    ],
    starterFiles: [
      {
        name: 'robot.js',
        content: `// Robot Adventure Starter Script
function navigateMaze(robot) {
  // Команди: robot.move(), robot.turnLeft(), robot.turnRight(), robot.scan()
  for (let i = 0; i < 4; i++) {
    robot.move();
  }
  robot.turnRight();
  robot.move();
  return robot.collectedCount;
}`
      }
    ],
    completed: true
  },
  {
    level: 1,
    title: 'Treasure Game',
    description: 'Текстова RPG гра з вибором дій, випадковими подіями, інвентарем та підрахунком очок здоровʼя.',
    language: 'javascript',
    requirements: [
      'Реалізувати ігровий цикл з перевіркою hp > 0',
      'Обробляти 4 напрямки руху (N, S, E, W)',
      'Нараховувати золото та артефакти',
      'Виводити повідомлення про перемогу або поразку'
    ],
    starterFiles: [
      {
        name: 'game.js',
        content: `export class TreasureGame {
  constructor(playerName) {
    this.player = { name: playerName, hp: 100, gold: 0 };
    this.gameOver = false;
  }
  explore(direction) {
    if (this.gameOver) return 'Гра завершена!';
    this.player.gold += 25;
    return \`Ви пішли на \${direction} та знайшли 25 золота!\`;
  }
}`
      }
    ],
    completed: false
  },
  {
    level: 2,
    title: 'Personal Finance Tracker',
    description: 'Особистий фінансовий трекер з фільтрацією доходів/витрат, категоріями, валідацією та збереженням.',
    language: 'javascript',
    requirements: [
      'Додавання транзакцій з датою, сумою, описом та тегом',
      'Обчислення загального балансу за формулою Дохід - Витрати',
      'Обробка помилок (некоректна сума або порожній опис)',
      'Експорт у форматі JSON'
    ],
    starterFiles: [
      {
        name: 'tracker.js',
        content: `export class FinanceTracker {
  constructor() {
    this.transactions = [];
  }
  addTransaction(amount, type, category) {
    if (amount <= 0) throw new Error('Сума має бути більшою за 0');
    this.transactions.push({ id: Date.now(), amount, type, category });
  }
  getBalance() {
    return this.transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  }
}`
      }
    ],
    completed: false
  },
  {
    level: 3,
    title: 'Student Portal',
    description: 'Веб-додаток студентського кабінету з DOM-маніпуляціями, асинхронним завантаженням та збереженням у LocalStorage.',
    language: 'javascript',
    requirements: [
      'Авторизація та відображення профілю студента',
      'Список навчальних курсів та прогресу',
      'Асинхронний fetch-запит до макетного API оцінок',
      'Збереження стану в браузері'
    ],
    starterFiles: [
      {
        name: 'portal.js',
        content: `export async function fetchStudentProfile(studentId) {
  // Асинхронне отримання даних
  return { id: studentId, name: 'Студент Архіпелагу', courses: ['JS Basics', 'Algorithms'] };
}`
      }
    ],
    completed: false
  },
  {
    level: 4,
    title: 'Fullstack Application',
    description: 'Повноцінна клієнт-серверна архітектура з TypeScript, валідацією DTO, REST API та базою даних.',
    language: 'typescript',
    requirements: [
      'Типізовані інтерфейси запитів та відповідей',
      'CRUD операції (Create, Read, Update, Delete)',
      'Обробка статус-кодів HTTP (200, 201, 400, 404, 500)',
      'Модульні тести контролерів'
    ],
    starterFiles: [
      {
        name: 'api.ts',
        content: `export interface UserDto {
  id: string;
  email: string;
  name: string;
}

export class ApiController {
  private users: Map<string, UserDto> = new Map();
  async createUser(dto: UserDto): Promise<UserDto> {
    this.users.set(dto.id, dto);
    return dto;
  }
}`
      }
    ],
    completed: false
  },
  {
    level: 5,
    title: 'Algorithm Lab',
    description: 'Бенчмарк та візуалізація алгоритмів сортування і пошуку на вибірках 10, 100, 1000, 10000 елементів.',
    language: 'typescript',
    requirements: [
      'Реалізація QuickSort та MergeSort',
      'Вимірювання точного часу виконання (performance.now())',
      'Підрахунок кількості операцій порівняння',
      'Оцінка просторової складності O(1) vs O(N)'
    ],
    starterFiles: [
      {
        name: 'sorter.ts',
        content: `export function benchmarkSort(arr: number[]): { timeMs: number; operations: number } {
  const start = performance.now();
  let operations = 0;
  // QuickSort implementation
  return { timeMs: performance.now() - start, operations };
}`
      }
    ],
    completed: false
  },
  {
    level: 6,
    title: 'Educational Platform API',
    description: 'Проектування бекенду освітньої платформи: Users, Courses, Lessons, Submissions, Progress з кешуванням.',
    language: 'typescript',
    requirements: [
      'Реляційна схема даних із зовнішніми ключами',
      'In-memory кешування частих запитів (Cache Hit / Miss)',
      'JWT аутентифікація та Role-Based Access Control',
      'Черга асинхронної обробки перевірки коду'
    ],
    starterFiles: [
      {
        name: 'lms-service.ts',
        content: `export class PlatformService {
  private cache = new Map<string, any>();
  async getLesson(id: string) {
    if (this.cache.has(id)) return { source: 'cache', data: this.cache.get(id) };
    const lesson = { id, title: 'Урок Архіпелагу' };
    this.cache.set(id, lesson);
    return { source: 'database', data: lesson };
  }
}`
      }
    ],
    completed: false
  },
  {
    level: 7,
    title: 'Distributed Job System',
    description: 'Розподілена система обробки фонових завдань із воркерами, таймаутами, повторними спробами (retry) та ідемпотентністю.',
    language: 'typescript',
    requirements: [
      'Черга задач з підтримкою пріоритетів',
      'Механізм Exponential Backoff для ретраїв',
      'Запобігання дублюванню за Idempotency-Key',
      'Моніторинг стану воркерів (Heartbeat)'
    ],
    starterFiles: [
      {
        name: 'queue.ts',
        content: `export class JobQueue {
  private queue: Array<{ id: string; payload: any; retries: number }> = [];
  push(job: any) { this.queue.push({ ...job, retries: 0 }); }
}`
      }
    ],
    completed: false
  },
  {
    level: 8,
    title: 'Scalable Platform Architecture',
    description: 'Архітектурний дизайн масштабованої системи: CDN, API Gateway, мікросервіси, брокер повідомлень та балансувальник.',
    language: 'architecture',
    requirements: [
      'Спроєктувати схему розподілу навантаження (Load Balancer)',
      'Обґрунтувати вибір SQL проти NoSQL для різних сервісів',
      'Забезпечити стійкість до збоїв (Circuit Breaker)',
      'Захист від DDoS та rate limiting'
    ],
    starterFiles: [
      {
        name: 'architecture.spec.json',
        content: `{
  "system": "Scalable Video Streaming & Transcoding",
  "components": ["CloudFlare CDN", "API Gateway", "Auth Service", "Kafka Queue", "Transcode Workers", "S3 Storage"]
}`
      }
    ],
    completed: false
  },
  {
    level: 9,
    title: 'Enterprise System Design',
    description: 'Проєктування глобальних платформ рівня Ride-Sharing (Uber), Video (YouTube) або Enterprise Education з SLA 99.99%.',
    language: 'enterprise',
    requirements: [
      'Гео-розподілена реплікація баз даних',
      'Механізм консистентного хешування (Consistent Hashing)',
      'Стратегія відновлення після катастроф (Disaster Recovery RTO/RPO)',
      'Розрахунок ємності сховища (Capacity Estimation)'
    ],
    starterFiles: [
      {
        name: 'system-design.md',
        content: `# Enterprise Architecture Document
## 1. Functional & Non-Functional Requirements
- Daily Active Users: 20,000,000
- Read/Write Ratio: 100:1
- Latency SLA: P99 < 50ms
## 2. High-Level Diagram`
      }
    ],
    completed: false
  }
];
