import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StateService } from '../../core/services/state.service';

@Component({
  selector: 'app-world-2d',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-white/10">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-black text-white tracking-wide">
              {{ t().world.mode2D }}
            </h1>
            <span class="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              ACCESSIBLE
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Повна топологічна схема цифрового архіпелагу з доступною навігацією для екранних читачів та швидкого доступу
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Switch to 3D -->
          <button
            (click)="switchTo3D()"
            class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs hover:opacity-95 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <mat-icon class="text-sm">view_in_ar</mat-icon>
            <span>{{ t().world.mode3D }}</span>
          </button>
        </div>
      </div>

      <!-- Category Filter Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          (click)="filterCategory.set('all')"
          [class]="filterCategory() === 'all' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'"
          class="px-3 py-1.5 rounded-xl transition-all whitespace-nowrap"
        >
          Всі острови ({{ islands().length }})
        </button>
        <button
          (click)="filterCategory.set('core')"
          [class]="filterCategory() === 'core' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'"
          class="px-3 py-1.5 rounded-xl transition-all whitespace-nowrap"
        >
          Базові та Архітектура
        </button>
        <button
          (click)="filterCategory.set('web')"
          [class]="filterCategory() === 'web' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'"
          class="px-3 py-1.5 rounded-xl transition-all whitespace-nowrap"
        >
          Web Екосистема
        </button>
        <button
          (click)="filterCategory.set('systems')"
          [class]="filterCategory() === 'systems' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'"
          class="px-3 py-1.5 rounded-xl transition-all whitespace-nowrap"
        >
          Системні & Низькорівневі
        </button>
        <button
          (click)="filterCategory.set('mobile')"
          [class]="filterCategory() === 'mobile' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'"
          class="px-3 py-1.5 rounded-xl transition-all whitespace-nowrap"
        >
          Мобільні
        </button>
        <button
          (click)="filterCategory.set('data')"
          [class]="filterCategory() === 'data' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'"
          class="px-3 py-1.5 rounded-xl transition-all whitespace-nowrap"
        >
          Дані & Бази
        </button>
      </div>

      <!-- Islands Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        @for (island of filteredIslands(); track island.id) {
          <div
            tabindex="0"
            role="button"
            (keydown.enter)="openIsland(island.id)"
            (click)="openIsland(island.id)"
            class="group cursor-pointer glass-panel p-5 rounded-2xl border border-white/10 hover:border-white/25 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl relative flex flex-col justify-between"
          >
            <!-- Top badge & icon -->
            <div class="space-y-3">
              <div class="flex items-start justify-between">
                <div
                  class="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105"
                  [style.background]="island.theme.primary"
                >
                  <mat-icon>{{ island.theme.icon }}</mat-icon>
                </div>
                <div class="text-right">
                  <span class="text-xs font-mono font-bold" [style.color]="island.theme.primary">
                    {{ island.progress }}%
                  </span>
                  <div class="text-[10px] text-slate-400">
                    {{ island.completedLessons }}/{{ island.totalLessons }} уроків
                  </div>
                </div>
              </div>

              <div>
                <h3 class="font-bold text-base text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                  {{ island.name }}
                </h3>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[10px] px-2 py-0.5 rounded-md font-mono uppercase" [class]="island.theme.badgeBg">
                    {{ island.difficulty }}
                  </span>
                  <span class="text-[11px] font-mono text-slate-400">
                    {{ island.language.toUpperCase() }}
                  </span>
                </div>
              </div>

              <!-- Progress bar -->
              <div class="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  [style.width.%]="island.progress"
                  [style.background]="island.theme.primary"
                ></div>
              </div>

              <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {{ island.description }}
              </p>
            </div>

            <!-- Bottom Action -->
            <div class="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold">
              <span class="text-slate-400 group-hover:text-slate-200 transition-colors">
                Переглянути трек
              </span>
              <div class="flex items-center gap-1 text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>{{ t().world.enterIsland }}</span>
                <mat-icon class="text-sm">arrow_forward</mat-icon>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class World2DComponent {
  private state = inject(StateService);

  readonly t = this.state.t;
  readonly islands = this.state.islands;
  readonly filterCategory = signal<string>('all');

  filteredIslands() {
    const cat = this.filterCategory();
    if (cat === 'all') return this.islands();
    return this.islands().filter(i => i.category === cat);
  }

  openIsland(id: string) {
    this.state.openIsland(id);
  }

  switchTo3D() {
    this.state.setView('world');
  }
}
