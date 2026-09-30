import { EducationalProfile, UserRole } from './archipelago.model';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profile: EducationalProfile;
  gradeLevel: string; // e.g. "9 клас", "2 курс"
  interests: string[];
  xp: number;
  level: number;
  streakDays: number;
  completedLessonsCount: number;
  achievements: Achievement[];
  integrityScore: number; // 0 - 100%
  settings: {
    language: 'uk' | 'en';
    theme: 'dark' | 'midnight' | 'cyber';
    soundEnabled: boolean;
    use2DMapDefault: boolean;
    fontSize: number;
  };
}
