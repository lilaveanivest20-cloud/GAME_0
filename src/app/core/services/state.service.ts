import { Injectable, computed, signal, inject } from '@angular/core';
import { EducationalProfile, Island, Lesson, UserRole } from '../models/archipelago.model';
import { UserProfile } from '../models/user.model';
import { INITIAL_ISLANDS } from '../data/islands.data';
import { INITIAL_LESSONS } from '../data/lessons.data';
import { translationsMap, ArchipelagoTranslations } from '../../i18n';
import { SoundFxService } from './sound-fx.service';

export type NavView = 'world' | 'map2d' | 'islands' | 'island-detail' | 'lesson' | 'ide' | 'labs' | 'projects' | 'careers' | 'teacher' | 'admin' | 'profile' | 'onboarding';

const STORAGE_KEY = 'archipelago_state_v2';

const DEFAULT_USER: UserProfile = {
  id: 'usr_student_01',
  name: 'Олександр Шевченко',
  email: 'alex.shevchenko@archipelago.edu',
  role: 'student',
  profile: 'college',
  gradeLevel: '2 курс',
  interests: ['Programming', 'Algorithms', 'Web', 'Linux'],
  xp: 3840,
  level: 4,
  streakDays: 14,
  completedLessonsCount: 42,
  integrityScore: 98,
  achievements: [
    {
      id: 'ach_first_code',
      title: 'Перший код',
      description: 'Успішно запущено першу програму в Архіпелазі.',
      icon: 'terminal',
      unlockedAt: '2026-09-10',
      rarity: 'common'
    },
    {
      id: 'ach_recursion_master',
      title: 'Підкорювач Складності',
      description: 'Пройдено всі завдання на O(log N) без використання повного розвʼязку.',
      icon: 'auto_awesome',
      unlockedAt: '2026-09-21',
      rarity: 'epic'
    },
    {
      id: 'ach_clean_coder',
      title: 'Майстер Чистого Коду',
      description: 'Отримано 100% схвалення автоматичного ревʼю без зауважень.',
      icon: 'verified',
      unlockedAt: '2026-09-25',
      rarity: 'rare'
    }
  ],
  settings: {
    language: 'uk',
    theme: 'dark',
    soundEnabled: true,
    use2DMapDefault: false,
    fontSize: 14
  }
};

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private soundService = inject(SoundFxService);

  // Core reactive signals
  readonly user = signal<UserProfile>(this.loadUser());
  readonly islands = signal<Island[]>(INITIAL_ISLANDS);
  readonly lessons = signal<Lesson[]>(INITIAL_LESSONS);
  readonly activeView = signal<NavView>('world');
  readonly activeIslandId = signal<string>('zero');
  readonly activeLessonId = signal<string>('lvl0-1-what-is-program');
  readonly activeLabTab = signal<string>('terminal');
  readonly hasCompletedOnboarding = signal<boolean>(this.checkOnboarding());

  // Integrity signals tracked in runtime
  readonly tabSwitchCounter = signal<number>(0);
  readonly pasteEventCounter = signal<number>(0);
  readonly hintsUsedInCurrentTask = signal<number>(0);

  // Computed state
  readonly activeIsland = computed(() => {
    const id = this.activeIslandId();
    return this.islands().find(i => i.id === id) || this.islands()[0];
  });

  readonly activeLesson = computed(() => {
    const id = this.activeLessonId();
    return this.lessons().find(l => l.id === id) || this.lessons()[0];
  });

  readonly currentLanguage = computed(() => this.user().settings.language);

  readonly t = computed<ArchipelagoTranslations>(() => {
    return translationsMap[this.currentLanguage()] || translationsMap['uk'];
  });

  readonly overallProgress = computed(() => {
    const all = this.islands();
    const sum = all.reduce((acc, i) => acc + i.progress, 0);
    return Math.round(sum / all.length);
  });

  constructor() {
    this.soundService.setSoundEnabled(this.user().settings.soundEnabled);
  }

  private loadUser(): UserProfile {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          return { ...DEFAULT_USER, ...JSON.parse(raw) };
        }
      } catch {
        // Fallback to default user if storage is unavailable or corrupt
      }
    }
    return DEFAULT_USER;
  }

  private checkOnboarding(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('archipelago_onboarded_v2') === 'true';
    }
    return false;
  }

  private persistUser() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user()));
      } catch {
        // Ignore quota/access errors in restricted environments
      }
    }
  }

  completeOnboarding(data: { profile: EducationalProfile; grade: string; interests: string[]; language: 'uk' | 'en' }) {
    this.user.update(u => ({
      ...u,
      profile: data.profile,
      gradeLevel: data.grade,
      interests: data.interests,
      settings: { ...u.settings, language: data.language }
    }));
    this.hasCompletedOnboarding.set(true);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('archipelago_onboarded_v2', 'true');
    }
    this.persistUser();
    this.activeView.set('world');
    this.soundService.playSuccess();
  }

  setLanguage(lang: 'uk' | 'en') {
    this.user.update(u => ({
      ...u,
      settings: { ...u.settings, language: lang }
    }));
    this.persistUser();
    this.soundService.playClick();
  }

  setRole(role: UserRole) {
    this.user.update(u => ({ ...u, role }));
    this.persistUser();
    this.soundService.playClick();
    if (role === 'teacher') this.activeView.set('teacher');
    else if (role === 'admin') this.activeView.set('admin');
  }

  setView(view: NavView) {
    this.activeView.set(view);
    this.soundService.playClick();
  }

  openIsland(islandId: string) {
    this.activeIslandId.set(islandId);
    this.activeView.set('island-detail');
    this.soundService.playClick();
  }

  openLesson(lessonId: string) {
    this.activeLessonId.set(lessonId);
    this.activeView.set('ide');
    this.hintsUsedInCurrentTask.set(0);
    this.tabSwitchCounter.set(0);
    this.pasteEventCounter.set(0);
    this.soundService.playClick();
  }

  recordTabSwitch() {
    this.tabSwitchCounter.update(c => c + 1);
  }

  recordPasteEvent() {
    this.pasteEventCounter.update(c => c + 1);
  }

  recordHintUsed(level: number) {
    this.hintsUsedInCurrentTask.set(level);
  }

  completeActiveLesson(score = 100) {
    const curLesson = this.activeLesson();
    const curIsland = this.activeIsland();

    // Update lesson
    this.lessons.update(list =>
      list.map(l => (l.id === curLesson.id ? { ...l, status: 'mastered', masteryScore: score } : l))
    );

    // Add XP & progress
    const addedXp = Math.max(20, Math.round(score * 0.8));
    this.user.update(u => ({
      ...u,
      xp: u.xp + addedXp,
      completedLessonsCount: u.completedLessonsCount + 1
    }));

    // Update island progress
    this.islands.update(list =>
      list.map(i => {
        if (i.id === curIsland.id) {
          const comp = Math.min(i.totalLessons, i.completedLessons + 1);
          return {
            ...i,
            completedLessons: comp,
            progress: Math.min(100, Math.round((comp / i.totalLessons) * 100))
          };
        }
        return i;
      })
    );

    this.persistUser();
    this.soundService.playSuccess();
  }

  toggleSound() {
    const nextVal = !this.user().settings.soundEnabled;
    this.user.update(u => ({
      ...u,
      settings: { ...u.settings, soundEnabled: nextVal }
    }));
    this.soundService.setSoundEnabled(nextVal);
    this.persistUser();
  }
}
