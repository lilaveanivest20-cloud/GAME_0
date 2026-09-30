import { CareerPath } from '../models/archipelago.model';

export const CAREER_PATHS_DATA: CareerPath[] = [
  {
    id: 'frontend',
    title: 'Frontend Developer',
    icon: 'web',
    description: 'Створення інтерактивних користувацьких інтерфейсів, доступності, SPA та анімацій.',
    skills: ['HTML5/CSS3', 'JavaScript ESNext', 'TypeScript', 'Angular/React', 'Tailwind', 'Performance Optimization'],
    islandIds: ['html-css', 'javascript', 'typescript'],
    levels: ['Level 1', 'Level 2', 'Level 3', 'Level 4'],
    matchRate: 94
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    icon: 'dns',
    description: 'Проєктування бізнес-логіки, REST/GraphQL API, мікросервісів, реляційних баз даних та кешування.',
    skills: ['Node.js/Go/Python', 'SQL & ORM', 'Redis', 'Docker', 'Authentication', 'System Design'],
    islandIds: ['python', 'go', 'sql', 'zero'],
    levels: ['Level 2', 'Level 4', 'Level 6', 'Level 8'],
    matchRate: 88
  },
  {
    id: 'fullstack',
    title: 'Fullstack Developer',
    icon: 'layers',
    description: 'Універсальний інженер, здатний побудувати продукт від клієнтського UX до серверної архітектури.',
    skills: ['Frontend Frameworks', 'API Development', 'Database Modeling', 'DevOps Basics', 'E2E Testing'],
    islandIds: ['javascript', 'typescript', 'sql', 'html-css'],
    levels: ['Level 1', 'Level 3', 'Level 4', 'Level 6'],
    matchRate: 91
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    icon: 'analytics',
    description: 'Аналіз даних, виявлення закономірностей, когортний аналіз, формування метрик та візуалізація.',
    skills: ['SQL Joins/Aggregates', 'Python (Pandas)', 'BI Tools', 'Statistics', 'Data Cleaning'],
    islandIds: ['sql', 'python'],
    levels: ['Level 1', 'Level 2', 'Level 5'],
    matchRate: 82
  },
  {
    id: 'data-engineer',
    title: 'Data Engineer',
    icon: 'storage',
    description: 'Побудова надійних конвеєрів даних (ETL/ELT), Data Warehouses, обробка потокових даних.',
    skills: ['Python', 'SQL', 'Airflow/Kafka', 'Distributed Storage', 'Data Pipelines'],
    islandIds: ['python', 'sql', 'bash', 'go'],
    levels: ['Level 4', 'Level 6', 'Level 7'],
    matchRate: 79
  },
  {
    id: 'devops',
    title: 'DevOps Engineer',
    icon: 'all_inclusive',
    description: 'Автоматизація CI/CD, хмарна інфраструктура (IaC), Kubernetes, Linux адміністрування, моніторинг.',
    skills: ['Bash Scripting', 'Linux Kernel', 'Docker/K8s', 'CI/CD Pipelines', 'Prometheus/Grafana'],
    islandIds: ['bash', 'go', 'python'],
    levels: ['Level 3', 'Level 6', 'Level 7'],
    matchRate: 85
  },
  {
    id: 'systems',
    title: 'Systems Developer',
    icon: 'memory',
    description: 'Низькорівневе програмування, драйвери, ядра ОС, мережеві стеки та вбудовані системи (Embedded).',
    skills: ['C/C++', 'Rust', 'Memory Allocation', 'Concurrency', 'POSIX', 'Assembly'],
    islandIds: ['cpp', 'rust', 'bash'],
    levels: ['Level 5', 'Level 7', 'Level 8'],
    matchRate: 76
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity Engineer',
    icon: 'security',
    description: 'Аудит коду, тестування на проникнення, захист мережевих протоколів, криптографія та DevSecOps.',
    skills: ['Network Security', 'Cryptography', 'Memory Exploits', 'Bash/Python Scripting', 'OWASP Top 10'],
    islandIds: ['bash', 'python', 'cpp'],
    levels: ['Level 4', 'Level 6', 'Level 7'],
    matchRate: 80
  },
  {
    id: 'mobile',
    title: 'Mobile Developer',
    icon: 'phone_android',
    description: 'Нативна та кросплатформна розробка додатків для смартфонів, планшетів і носіїв.',
    skills: ['Kotlin (Android)', 'Swift (iOS)', 'Jetpack Compose / SwiftUI', 'Mobile Architecture', 'Offline Sync'],
    islandIds: ['kotlin', 'swift'],
    levels: ['Level 2', 'Level 4', 'Level 6'],
    matchRate: 83
  },
  {
    id: 'game-dev',
    title: 'Game Developer',
    icon: 'sports_esports',
    description: 'Створення 2D/3D ігор, ігрових механік, фізики, шейдерів та штучного інтелекту ворогів.',
    skills: ['C# (Unity)', 'C++ (Unreal)', 'Lua (Roblox/Defold)', 'Game Loop', 'Math & Vectors'],
    islandIds: ['csharp', 'cpp', 'lua'],
    levels: ['Level 2', 'Level 4', 'Level 5'],
    matchRate: 86
  },
  {
    id: 'ai-engineer',
    title: 'AI / ML Engineer',
    icon: 'psychology',
    description: 'Розробка та інтеграція LLM, компʼютерного зору, генеративного ШІ та нейромережевих агентів.',
    skills: ['Python', 'TensorFlow/PyTorch', 'Prompt Engineering', 'Vector DBs (RAG)', 'Model Fine-tuning'],
    islandIds: ['python', 'sql'],
    levels: ['Level 4', 'Level 5', 'Level 7'],
    matchRate: 90
  },
  {
    id: 'architect',
    title: 'Software Architect',
    icon: 'account_tree',
    description: 'Високорівневе проектування enterprise-систем, баланс trade-offs, надійність, масштабування до мільйонів RPS.',
    skills: ['Domain-Driven Design (DDD)', 'Microservices vs Monolith', 'Fault Tolerance', 'Event-Driven Arch', 'Cost Optimization'],
    islandIds: ['zero', 'go', 'java', 'rust'],
    levels: ['Level 7', 'Level 8', 'Level 9'],
    matchRate: 75
  }
];
