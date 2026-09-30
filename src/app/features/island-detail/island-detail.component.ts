import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StateService } from '../../core/services/state.service';

@Component({
  selector: 'app-island-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      <!-- Back Navigation & Island Banner -->
      <div class="space-y-4">
        <button
          (click)="backToWorld()"
          class="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <mat-icon class="text-sm">arrow_back</mat-icon>
          <span>Повернутися до Архіпелагу</span>
        </button>

        <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
          <div
            class="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
            [style.background]="island().theme.primary"
          ></div>

          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div class="flex items-center gap-4">
              <div
                class="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/40"
                [style.background]="island().theme.primary"
              >
                <mat-icon class="text-3xl">{{ island().theme.icon }}</mat-icon>
              </div>

              <div>
                <div class="flex items-center gap-2">
                  <h1 class="text-2xl sm:text-3xl font-extrabold text-white">
                    {{ island().name.toUpperCase() }}
                  </h1>
                  <span class="text-xs px-2.5 py-0.5 rounded-full font-mono uppercase" [class]="island().theme.badgeBg">
                    {{ island().difficulty }}
                  </span>
                </div>
                <p class="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  {{ island().description }}
                </p>
              </div>
            </div>

            <!-- Stats Matrix -->
            <div class="grid grid-cols-3 gap-3 bg-slate-900/80 p-3 rounded-2xl border border-white/5 text-center">
              <div>
                <div class="text-[10px] text-slate-400 uppercase font-mono">Прогрес</div>
                <div class="text-lg font-black text-emerald-400 font-mono">{{ island().progress }}%</div>
              </div>
              <div class="border-x border-white/5 px-2">
                <div class="text-[10px] text-slate-400 uppercase font-mono">XP Зароблено</div>
                <div class="text-lg font-black text-amber-400 font-mono">{{ island().completedLessons * 120 }}</div>
              </div>
              <div>
                <div class="text-[10px] text-slate-400 uppercase font-mono">Уроків</div>
                <div class="text-lg font-black text-cyan-400 font-mono">
                  {{ island().completedLessons }}/{{ island().totalLessons }}
                </div>
              </div>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="mt-6 w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-white/5">
            <div
              class="h-full rounded-full transition-all duration-700 shadow-lg"
              [style.width.%]="island().progress"
              [style.background]="island().theme.primary"
            ></div>
          </div>
        </div>
      </div>

      <!-- LEARNING PATH: Dependency Graph -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-white flex items-center gap-2">
              <mat-icon class="text-emerald-400 text-lg">alt_route</mat-icon>
              <span>Граф навчальних траєкторій (Learning Path)</span>
            </h2>
            <p class="text-xs text-slate-400">
              Теми впорядковані за графом передумов. Для отримання статусу "Mastered" необхідний бал ≥ 80%.
            </p>
          </div>

          <!-- Status legend -->
          <div class="hidden sm:flex items-center gap-3 text-[11px] font-mono">
            <span class="flex items-center gap-1 text-slate-400">
              <span class="w-2 h-2 rounded-full bg-slate-600"></span> Not Started
            </span>
            <span class="flex items-center gap-1 text-amber-400">
              <span class="w-2 h-2 rounded-full bg-amber-400"></span> Practicing
            </span>
            <span class="flex items-center gap-1 text-emerald-400">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span> Mastered ≥ 80%
            </span>
          </div>
        </div>

        <!-- Dependency Graph Flow -->
        <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
          <!-- Flow Node Row 1: Foundations -->
          <div class="flex flex-col items-center gap-4">
            <button
              (click)="startLesson('lvl0-1-what-is-program')"
              class="cursor-pointer max-w-md w-full p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 transition-all shadow-lg hover:shadow-emerald-500/10 hover:scale-[1.01] flex items-center justify-between text-left"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  0.1
                </div>
                <div>
                  <div class="font-bold text-xs sm:text-sm text-white">Змінні та Послідовності дій</div>
                  <div class="text-[11px] text-slate-400 font-mono">Variables & Execution Sequence</div>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                MASTERED 85%
              </span>
            </button>

            <!-- Down Arrow -->
            <div class="flex flex-col items-center text-slate-500">
              <div class="w-0.5 h-6 bg-gradient-to-b from-emerald-500 to-amber-500"></div>
              <mat-icon class="text-amber-500 text-sm -mt-1">arrow_downward</mat-icon>
            </div>

            <!-- Flow Node Row 2: Conditions -->
            <button
              (click)="startLesson('lvl1-variables-basics')"
              class="cursor-pointer max-w-md w-full p-4 rounded-2xl bg-slate-900 border border-amber-500/40 hover:border-amber-400 transition-all shadow-lg hover:shadow-amber-500/10 hover:scale-[1.01] flex items-center justify-between text-left"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  1.1
                </div>
                <div>
                  <div class="font-bold text-xs sm:text-sm text-white">Умови та Логічні розгалуження</div>
                  <div class="text-[11px] text-slate-400 font-mono">Conditions (if / else / operators)</div>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                PRACTICING 70%
              </span>
            </button>

            <!-- Down Arrow -->
            <div class="flex flex-col items-center text-slate-500">
              <div class="w-0.5 h-6 bg-gradient-to-b from-amber-500 to-cyan-500"></div>
              <mat-icon class="text-cyan-500 text-sm -mt-1">arrow_downward</mat-icon>
            </div>

            <!-- Flow Node Row 3: Loops -->
            <button
              (click)="startLesson('lvl0-4-loops-visual')"
              class="cursor-pointer max-w-md w-full p-4 rounded-2xl bg-slate-900 border border-white/10 hover:border-cyan-400 transition-all shadow-lg hover:scale-[1.01] flex items-center justify-between text-left"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  1.4
                </div>
                <div>
                  <div class="font-bold text-xs sm:text-sm text-white">Цикли та Багаторазове повторення</div>
                  <div class="text-[11px] text-slate-400 font-mono">Loops (for / while)</div>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-800 text-slate-400">
                NOT STARTED
              </span>
            </button>

            <!-- Down Arrow Split into Two Branches -->
            <div class="flex items-center justify-center gap-16 text-slate-500 py-1">
              <div class="flex flex-col items-center">
                <div class="w-0.5 h-6 bg-slate-700"></div>
                <mat-icon class="text-slate-500 text-sm -mt-1">south_west</mat-icon>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-0.5 h-6 bg-slate-700"></div>
                <mat-icon class="text-slate-500 text-sm -mt-1">south_east</mat-icon>
              </div>
            </div>

            <!-- Flow Node Row 4: Split into Arrays and Objects -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
              <!-- Branch A: Arrays -->
              <button
                (click)="startLesson('lvl2-arrays-objects')"
                class="cursor-pointer p-4 rounded-2xl bg-slate-900 border border-white/10 hover:border-indigo-400 transition-all shadow-lg hover:scale-[1.01] flex items-center justify-between text-left"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    2.1
                  </div>
                  <div>
                    <div class="font-bold text-xs text-white">Масиви (Arrays)</div>
                    <div class="text-[10px] text-slate-400 font-mono">Списки, індекси, map/filter</div>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-400">
                  NOT STARTED
                </span>
              </button>

              <!-- Branch B: Objects -->
              <button
                (click)="startLesson('lvl2-arrays-objects')"
                class="cursor-pointer p-4 rounded-2xl bg-slate-900 border border-white/10 hover:border-violet-400 transition-all shadow-lg hover:scale-[1.01] flex items-center justify-between text-left"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-xs">
                    2.2
                  </div>
                  <div>
                    <div class="font-bold text-xs text-white">Обʼєкти (Objects)</div>
                    <div class="text-[10px] text-slate-400 font-mono">Ключі, методи, стан</div>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-400">
                  NOT STARTED
                </span>
              </button>
            </div>

            <!-- Merge Arrows -->
            <div class="flex flex-col items-center text-slate-500">
              <div class="w-0.5 h-6 bg-slate-700"></div>
              <mat-icon class="text-slate-500 text-sm -mt-1">arrow_downward</mat-icon>
            </div>

            <!-- Flow Node Row 5: Algorithms & Big-O -->
            <button
              (click)="startLesson('lvl5-algorithms-big-o')"
              class="cursor-pointer max-w-md w-full p-4 rounded-2xl bg-slate-900 border border-white/10 hover:border-pink-500 transition-all shadow-lg hover:scale-[1.01] flex items-center justify-between text-left"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold">
                  5.1
                </div>
                <div>
                  <div class="font-bold text-xs sm:text-sm text-white">Алгоритми та Складність O(log N)</div>
                  <div class="text-[11px] text-slate-400 font-mono">Binary Search & Sorting</div>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-800 text-slate-400">
                NOT STARTED
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class IslandDetailComponent {
  private state = inject(StateService);

  readonly island = this.state.activeIsland;
  readonly t = this.state.t;

  backToWorld() {
    this.state.setView('world');
  }

  startLesson(lessonId: string) {
    this.state.openLesson(lessonId);
  }
}
