import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StateService, NavView } from '../../../core/services/state.service';
import { UserRole } from '../../../core/models/archipelago.model';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <header class="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-white/10 px-4 py-2.5">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <!-- Logo & Brand -->
        <button
          type="button"
          (click)="navigate('world')"
          class="flex items-center gap-3 cursor-pointer group text-left bg-transparent border-0 p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-xl"
        >
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
            <div class="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <mat-icon class="text-emerald-400 text-lg">public</mat-icon>
            </div>
          </div>
          <div>
            <div class="font-bold text-sm tracking-wider bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent flex items-center gap-1.5">
              {{ t().appTitle }}
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-normal">ENTERPRISE</span>
            </div>
            <div class="text-[11px] text-slate-400 hidden sm:block truncate max-w-[280px]">
              {{ t().appSlogan }}
            </div>
          </div>
        </button>

        <!-- Navigation Links -->
        <nav class="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5 text-xs font-medium">
          <button
            (click)="navigate('world')"
            [class]="activeView() === 'world' ? activeTabClass : inactiveTabClass"
          >
            <mat-icon class="text-sm">travel_explore</mat-icon>
            {{ t().nav.world }}
          </button>

          <button
            (click)="navigate('map2d')"
            [class]="activeView() === 'map2d' ? activeTabClass : inactiveTabClass"
          >
            <mat-icon class="text-sm">map</mat-icon>
            {{ t().nav.map2d }}
          </button>

          <button
            (click)="navigate('ide')"
            [class]="activeView() === 'ide' ? activeTabClass : inactiveTabClass"
          >
            <mat-icon class="text-sm">terminal</mat-icon>
            {{ t().nav.ide }}
          </button>

          <button
            (click)="navigate('labs')"
            [class]="activeView() === 'labs' ? activeTabClass : inactiveTabClass"
          >
            <mat-icon class="text-sm">science</mat-icon>
            {{ t().nav.labs }}
          </button>

          <button
            (click)="navigate('projects')"
            [class]="activeView() === 'projects' ? activeTabClass : inactiveTabClass"
          >
            <mat-icon class="text-sm">rocket_launch</mat-icon>
            {{ t().nav.projects }}
          </button>

          <button
            (click)="navigate('careers')"
            [class]="activeView() === 'careers' ? activeTabClass : inactiveTabClass"
          >
            <mat-icon class="text-sm">timeline</mat-icon>
            {{ t().nav.careers }}
          </button>

          @if (user().role === 'teacher' || user().role === 'admin' || user().role === 'master') {
            <button
              (click)="navigate('teacher')"
              [class]="activeView() === 'teacher' ? activeTabClass : inactiveTabClass"
            >
              <mat-icon class="text-sm">school</mat-icon>
              {{ t().nav.teacher }}
            </button>
          }

          @if (user().role === 'admin') {
            <button
              (click)="navigate('admin')"
              [class]="activeView() === 'admin' ? activeTabClass : inactiveTabClass"
            >
              <mat-icon class="text-sm">admin_panel_settings</mat-icon>
              {{ t().nav.admin }}
            </button>
          }
        </nav>

        <!-- Right Side: Stats & User Role & Lang -->
        <div class="flex items-center gap-2">
          <!-- User Stats Badges (Clickable for Detailed Progress) -->
          <button
            type="button"
            (click)="toggleProgressModal()"
            class="hidden md:flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800/90 px-2.5 py-1 rounded-xl border border-white/10 hover:border-emerald-500/40 text-xs transition-all cursor-pointer group"
            title="Переглянути детальний прогрес, рівень та досягнення"
          >
            <div class="flex items-center gap-1 text-amber-400 font-semibold" title="Досвід XP">
              <mat-icon class="text-amber-400 text-sm">stars</mat-icon>
              <span>{{ user().xp }} XP</span>
            </div>
            <div class="w-px h-3.5 bg-white/10"></div>
            <div class="flex items-center gap-1 text-emerald-400 font-medium" title="Рівень">
              <mat-icon class="text-emerald-400 text-sm">military_tech</mat-icon>
              <span>Lvl {{ user().level }}</span>
            </div>
            <div class="w-px h-3.5 bg-white/10"></div>
            <div class="flex items-center gap-1 text-cyan-400 font-medium" title="Цілісність / Integrity">
              <mat-icon class="text-cyan-400 text-sm">verified_user</mat-icon>
              <span>{{ user().integrityScore }}%</span>
            </div>
            <mat-icon class="text-slate-500 group-hover:text-emerald-400 text-xs transition-colors ml-0.5">query_stats</mat-icon>
          </button>

          <!-- Quick Progress Button for mobile/small screens -->
          <button
            type="button"
            (click)="toggleProgressModal()"
            class="md:hidden p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-emerald-400 transition-colors"
            title="Мій Прогрес"
          >
            <mat-icon class="text-sm">analytics</mat-icon>
          </button>

          <!-- Role Selector -->
          <div class="relative group">
            <button class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-medium text-slate-300 transition-colors">
              <mat-icon class="text-sm text-indigo-400">badge</mat-icon>
              <span class="capitalize">{{ roleLabel(user().role) }}</span>
              <mat-icon class="text-xs text-slate-400">arrow_drop_down</mat-icon>
            </button>
            <div class="absolute right-0 mt-1 w-44 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-1 hidden group-hover:block group-focus-within:block z-50">
              <div class="px-2 py-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                {{ t().roles.switchRole }}
              </div>
              <button
                (click)="setRole('student')"
                class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 text-left transition-colors"
                [class.text-emerald-400]="user().role === 'student'"
              >
                <mat-icon class="text-xs">person</mat-icon>
                {{ t().roles.student }}
              </button>
              <button
                (click)="setRole('teacher')"
                class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 text-left transition-colors"
                [class.text-indigo-400]="user().role === 'teacher'"
              >
                <mat-icon class="text-xs">school</mat-icon>
                {{ t().roles.teacher }}
              </button>
              <button
                (click)="setRole('master')"
                class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 text-left transition-colors"
                [class.text-amber-400]="user().role === 'master'"
              >
                <mat-icon class="text-xs">construction</mat-icon>
                {{ t().roles.master }}
              </button>
              <button
                (click)="setRole('admin')"
                class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 text-left transition-colors"
                [class.text-rose-400]="user().role === 'admin'"
              >
                <mat-icon class="text-xs">shield</mat-icon>
                {{ t().roles.admin }}
              </button>
            </div>
          </div>

          <!-- Language Selector -->
          <div class="flex items-center bg-slate-900 border border-white/10 rounded-xl p-0.5 text-xs">
            <button
              (click)="setLanguage('uk')"
              [class]="currentLang() === 'uk' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'"
              class="px-2 py-1 rounded-lg transition-colors"
              title="Українська"
            >
              UA
            </button>
            <button
              (click)="setLanguage('en')"
              [class]="currentLang() === 'en' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'"
              class="px-2 py-1 rounded-lg transition-colors"
              title="English"
            >
              EN
            </button>
          </div>

          <!-- Sound Toggle -->
          <button
            (click)="toggleSound()"
            class="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 transition-colors"
            [title]="user().settings.soundEnabled ? 'Звук увімкнено' : 'Звук вимкнено'"
          >
            <mat-icon class="text-sm">
              {{ user().settings.soundEnabled ? 'volume_up' : 'volume_off' }}
            </mat-icon>
          </button>

          <!-- Onboarding / Info Trigger -->
          <button
            (click)="navigate('onboarding')"
            class="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 transition-colors"
            title="Перезапустити гід"
          >
            <mat-icon class="text-sm">help_outline</mat-icon>
          </button>
        </div>
      </div>

      <!-- Mobile navigation bar -->
      <div class="lg:hidden flex items-center justify-between gap-1 pt-2 overflow-x-auto text-[11px] border-t border-white/5 mt-2">
        <button (click)="navigate('world')" [class]="activeView() === 'world' ? 'text-emerald-400 font-bold' : 'text-slate-400'" class="px-2 py-1 whitespace-nowrap">
          {{ t().nav.world }}
        </button>
        <button (click)="navigate('map2d')" [class]="activeView() === 'map2d' ? 'text-emerald-400 font-bold' : 'text-slate-400'" class="px-2 py-1 whitespace-nowrap">
          {{ t().nav.map2d }}
        </button>
        <button (click)="navigate('ide')" [class]="activeView() === 'ide' ? 'text-emerald-400 font-bold' : 'text-slate-400'" class="px-2 py-1 whitespace-nowrap">
          {{ t().nav.ide }}
        </button>
        <button (click)="navigate('labs')" [class]="activeView() === 'labs' ? 'text-emerald-400 font-bold' : 'text-slate-400'" class="px-2 py-1 whitespace-nowrap">
          {{ t().nav.labs }}
        </button>
        <button (click)="navigate('projects')" [class]="activeView() === 'projects' ? 'text-emerald-400 font-bold' : 'text-slate-400'" class="px-2 py-1 whitespace-nowrap">
          {{ t().nav.projects }}
        </button>
        <button (click)="navigate('careers')" [class]="activeView() === 'careers' ? 'text-emerald-400 font-bold' : 'text-slate-400'" class="px-2 py-1 whitespace-nowrap">
          {{ t().nav.careers }}
        </button>
      </div>

      <!-- PROGRESS & STATS DASHBOARD MODAL -->
      @if (showProgressModal()) {
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="glass-panel w-full max-w-2xl bg-slate-950/95 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <!-- Header -->
            <div class="p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg">
                  <mat-icon class="text-xl">insights</mat-icon>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white flex items-center gap-2">
                    Мій Прогрес & Досягнення
                    <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                      Рівень {{ user().level }}
                    </span>
                  </h3>
                  <p class="text-xs text-slate-400">
                    {{ user().name }} • {{ user().profile }} ({{ user().gradeLevel }})
                  </p>
                </div>
              </div>

              <button
                type="button"
                (click)="toggleProgressModal()"
                class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <mat-icon class="text-base">close</mat-icon>
              </button>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-6 overflow-y-auto">
              <!-- XP & Level Progress Bar -->
              <div class="bg-slate-900/90 p-4 rounded-2xl border border-white/5 space-y-3">
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    <mat-icon class="text-amber-400 text-sm">military_tech</mat-icon>
                    <span class="font-bold text-white">Рівень {{ user().level }}</span>
                    <span class="text-slate-400 font-mono">({{ user().xp }} XP всього)</span>
                  </div>
                  <span class="text-emerald-400 font-mono font-semibold">До Рівня {{ user().level + 1 }}: {{ 5000 - (user().xp % 5000) }} XP</span>
                </div>

                <div class="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div
                    class="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-500"
                    [style.width.%]="xpProgressPercent()"
                  ></div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center text-xs">
                  <div class="bg-slate-950/80 p-2.5 rounded-xl border border-white/5">
                    <div class="text-slate-400 text-[10px]">Пройдено завдань</div>
                    <div class="text-base font-bold text-emerald-400 font-mono">{{ user().completedLessonsCount }}</div>
                  </div>
                  <div class="bg-slate-950/80 p-2.5 rounded-xl border border-white/5">
                    <div class="text-slate-400 text-[10px]">Ударний режим 🔥</div>
                    <div class="text-base font-bold text-amber-400 font-mono">{{ user().streakDays }} днів</div>
                  </div>
                  <div class="bg-slate-950/80 p-2.5 rounded-xl border border-white/5">
                    <div class="text-slate-400 text-[10px]">Цілісність коду</div>
                    <div class="text-base font-bold text-cyan-400 font-mono">{{ user().integrityScore }}%</div>
                  </div>
                  <div class="bg-slate-950/80 p-2.5 rounded-xl border border-white/5">
                    <div class="text-slate-400 text-[10px]">Загальний прогрес</div>
                    <div class="text-base font-bold text-indigo-400 font-mono">{{ overallProgress() }}%</div>
                  </div>
                </div>
              </div>

              <!-- Archipelago Islands Progress List -->
              <div class="space-y-3">
                <div class="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span class="flex items-center gap-1.5">
                    <mat-icon class="text-emerald-400 text-sm">travel_explore</mat-icon>
                    Прогрес по Островах Архіпелагу
                  </span>
                  <span class="text-[11px] text-slate-400 font-mono">
                    {{ islands().length }} Островів
                  </span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                  @for (island of islands(); track island.id) {
                    <div class="bg-slate-900/70 p-3 rounded-xl border border-white/5 flex flex-col justify-between space-y-2">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-bold text-white">{{ island.name }}</span>
                          <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono uppercase">
                            {{ island.language }}
                          </span>
                        </div>
                        <span class="text-xs font-mono font-bold text-emerald-400">{{ island.progress }}%</span>
                      </div>

                      <div class="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div
                          class="h-full bg-emerald-500 rounded-full"
                          [style.width.%]="island.progress"
                        ></div>
                      </div>

                      <div class="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{{ island.completedLessons }} / {{ island.totalLessons }} уроків</span>
                        <button
                          type="button"
                          (click)="openIsland(island.id)"
                          class="text-emerald-400 hover:underline font-semibold"
                        >
                          Перейти →
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Achievements Section -->
              <div class="space-y-3">
                <div class="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <mat-icon class="text-amber-400 text-sm">military_tech</mat-icon>
                  Останні досягнення
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  @for (ach of user().achievements; track ach.id) {
                    <div class="bg-slate-900/50 p-3 rounded-xl border border-white/5 space-y-1">
                      <div class="flex items-center gap-2">
                        <mat-icon class="text-amber-400 text-sm">{{ ach.icon }}</mat-icon>
                        <span class="font-bold text-xs text-white">{{ ach.title }}</span>
                      </div>
                      <p class="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                        {{ ach.description }}
                      </p>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="p-4 border-t border-white/10 bg-slate-900 flex items-center justify-end">
              <button
                type="button"
                (click)="toggleProgressModal()"
                class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Продовжити навчання
              </button>
            </div>
          </div>
        </div>
      }
    </header>
  `
})
export class NavbarComponent {
  private state = inject(StateService);

  readonly user = this.state.user;
  readonly islands = this.state.islands;
  readonly activeView = this.state.activeView;
  readonly currentLang = this.state.currentLanguage;
  readonly overallProgress = this.state.overallProgress;
  readonly t = this.state.t;

  readonly showProgressModal = signal<boolean>(false);

  readonly xpProgressPercent = computed(() => {
    const cur = this.user().xp % 5000;
    return Math.min(100, Math.round((cur / 5000) * 100));
  });

  readonly activeTabClass = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30 transition-all';
  readonly inactiveTabClass = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all';

  navigate(view: NavView) {
    this.state.setView(view);
  }

  toggleProgressModal() {
    this.showProgressModal.update((v: boolean) => !v);
  }

  openIsland(islandId: string) {
    this.showProgressModal.set(false);
    this.state.openIsland(islandId);
  }

  setRole(role: UserRole) {
    this.state.setRole(role);
  }

  setLanguage(lang: 'uk' | 'en') {
    this.state.setLanguage(lang);
  }

  toggleSound() {
    this.state.toggleSound();
  }

  roleLabel(role: UserRole): string {
    const map: Record<UserRole, string> = {
      student: this.t().roles.student,
      teacher: this.t().roles.teacher,
      master: this.t().roles.master,
      admin: this.t().roles.admin
    };
    return map[role] || role;
  }
}
