import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StateService } from '../../core/services/state.service';
import { CAREER_PATHS_DATA } from '../../core/data/careers.data';
import { CareerPath } from '../../core/models/archipelago.model';

@Component({
  selector: 'app-career-paths',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-2">
        <div class="flex items-center gap-2">
          <h1 class="text-xl sm:text-2xl font-black text-white">
            {{ t().nav.careers }}
          </h1>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            12 SPECIALIZATIONS
          </span>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed max-w-3xl">
          Оберіть інженерну спеціалізацію для формування персональної освітньої траєкторії. Кожен трек базується на обʼєктивних компетенціях, практичних проектах та архітектурних вимогах галузі.
        </p>
      </div>

      <!-- Careers Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        @for (path of careers; track path.id) {
          <div
            tabindex="0"
            role="button"
            (keydown.enter)="selectPath(path)"
            (click)="selectPath(path)"
            [class]="selectedPath()?.id === path.id ? 'border-emerald-500/80 bg-slate-900/90 shadow-emerald-500/10' : 'border-white/10 bg-slate-900/50 hover:border-white/20'"
            class="glass-panel p-5 rounded-3xl border cursor-pointer transition-all hover:translate-y-[-2px] flex flex-col justify-between space-y-4"
          >
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div class="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <mat-icon>{{ path.icon }}</mat-icon>
                </div>
                <div class="text-right">
                  <div class="text-xs font-mono font-bold text-emerald-400">{{ path.matchRate }}% Match</div>
                  <div class="text-[10px] text-slate-500">з вашим профілем</div>
                </div>
              </div>

              <div>
                <h3 class="font-bold text-base text-white">{{ path.title }}</h3>
                <p class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {{ path.description }}
                </p>
              </div>

              <!-- Skills tags -->
              <div class="flex flex-wrap gap-1.5 pt-1">
                @for (skill of path.skills; track skill) {
                  <span class="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-white/5 font-mono">
                    {{ skill }}
                  </span>
                }
              </div>
            </div>

            <!-- Road levels list -->
            <div class="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span class="text-slate-400 font-mono text-[11px]">{{ path.levels.join(' ➔ ') }}</span>
              <mat-icon class="text-slate-400 text-sm">arrow_forward</mat-icon>
            </div>
          </div>
        }
      </div>

      <!-- Selected Path Modal/Drawer -->
      @if (selectedPath(); as sel) {
        <div class="glass-panel-elevated p-6 rounded-3xl border border-emerald-500/30 space-y-4 animate-fade-in">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <mat-icon class="text-emerald-400 text-2xl">{{ sel.icon }}</mat-icon>
              <div>
                <h3 class="font-bold text-lg text-white">Траєкторія: {{ sel.title }}</h3>
                <div class="text-xs text-slate-400">Повний покроковий план освоєння компетенцій</div>
              </div>
            </div>
            <button (click)="selectedPath.set(null)" class="text-slate-400 hover:text-white">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- Step Milestone Flow -->
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <div class="bg-slate-950 p-3 rounded-2xl border border-emerald-500/30">
              <div class="text-[10px] font-mono text-emerald-400 font-bold">ЕТАП 1</div>
              <div class="font-bold text-xs text-white mt-1">Основи програмування</div>
              <p class="text-[10px] text-slate-400 mt-1">Синтаксис, змінні, цикли, структури.</p>
            </div>
            <div class="bg-slate-950 p-3 rounded-2xl border border-cyan-500/30">
              <div class="text-[10px] font-mono text-cyan-400 font-bold">ЕТАП 2</div>
              <div class="font-bold text-xs text-white mt-1">Алгоритми та Бази</div>
              <p class="text-[10px] text-slate-400 mt-1">Big-O, SQL, реляційні звʼязки, API.</p>
            </div>
            <div class="bg-slate-950 p-3 rounded-2xl border border-indigo-500/30">
              <div class="text-[10px] font-mono text-indigo-400 font-bold">ЕТАП 3</div>
              <div class="font-bold text-xs text-white mt-1">Професійна інженерія</div>
              <p class="text-[10px] text-slate-400 mt-1">Тестування, CI/CD, оптимізація, Docker.</p>
            </div>
            <div class="bg-slate-950 p-3 rounded-2xl border border-amber-500/30">
              <div class="text-[10px] font-mono text-amber-400 font-bold">ЕТАП 4</div>
              <div class="font-bold text-xs text-white mt-1">Enterprise Архітектура</div>
              <p class="text-[10px] text-slate-400 mt-1">System Design, високонавантажені системи.</p>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CareerPathsComponent {
  private state = inject(StateService);
  readonly t = this.state.t;
  readonly careers = CAREER_PATHS_DATA;
  readonly selectedPath = signal<CareerPath | null>(CAREER_PATHS_DATA[0]);

  selectPath(path: CareerPath) {
    this.selectedPath.set(path);
  }
}
