export type UserRole = 'student' | 'teacher' | 'master' | 'admin';

export type EducationalProfile = 'school' | 'vocational' | 'college' | 'university';

export type LevelId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface IslandTheme {
  primary: string;
  glow: string;
  particles: string;
  badgeBg: string;
  icon: string;
  accent: string;
}

export interface Island {
  id: string;
  name: string;
  language: string;
  position: { x: number; y: number; z: number };
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master' | 'Core';
  progress: number;
  theme: IslandTheme;
  locked: boolean;
  completedLessons: number;
  totalLessons: number;
  description: string;
  category: 'core' | 'web' | 'systems' | 'data' | 'scripting' | 'mobile';
  prerequisites: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  type: 'multiple-choice' | 'prediction' | 'fix-code';
}

export interface TestCase {
  id: string;
  title: string;
  input: string;
  expected: string;
  hidden?: boolean;
}

export interface Lesson {
  id: string;
  islandId: string;
  level: LevelId;
  title: string;
  objective: string;
  prerequisites: string[];
  outcomes: string[];
  theory: string;
  visualExplanation: string;
  codeExample: string;
  breakdown: string[];
  stepByStep: string[];
  knowledgeCheck: QuizQuestion[];
  starterCode: string;
  solutionCode: string;
  testCases: TestCase[];
  oracleConcept: string;
  oraclePseudocode: string;
  oracleSolution: string;
  challenge: string;
  miniProject: string;
  status: 'not-started' | 'learning' | 'practicing' | 'mastered';
  masteryScore: number;
  hintLevelUsed: number; // 0 none, 1 concept, 2 pseudocode, 3 solution
}

export interface CareerPath {
  id: string;
  title: string;
  icon: string;
  description: string;
  skills: string[];
  islandIds: string[];
  levels: string[];
  matchRate: number;
}

export interface FinalProject {
  level: LevelId;
  title: string;
  description: string;
  language: string;
  requirements: string[];
  starterFiles: { name: string; content: string }[];
  completed: boolean;
}
