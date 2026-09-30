import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StateService } from '../../core/services/state.service';
import { FINAL_PROJECTS_DATA } from '../../core/data/projects.data';
import { FinalProject } from '../../core/models/archipelago.model';

@Component({
  selector: 'app-projects-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-2">
        <div class="flex items-center gap-2">
          <h1 class="text-xl sm:text-2xl font-black text-white">
            {{ t().nav.projects }}
          </h1>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
            10 FINAL LEVEL PROJECTS
          </span>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed max-w-3xl">
          Кожен освітній рівень завершується повномасштабним інженерним проектом — від автономного робота до глобальної enterprise-архітектури.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        @for (proj of projects; track proj.level) {
          <div
            tabindex="0"
            role="button"
            (keydown.enter)="selectProject(proj)"
            (click)="selectProject(proj)"
            class="glass-panel p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
          >
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-slate-800 text-cyan-400 border border-white/5">
                  LEVEL {{ proj.level }}
                </span>
                @if (proj.completed) {
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <mat-icon class="text-xs">check</mat-icon> ВИКОНАНО
                  </span>
                } @else {
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-900 border border-white/5">
                    В ПРОЦЕСІ
                  </span>
                }
              </div>

              <div>
                <h3 class="font-bold text-lg text-white group-hover:text-cyan-300 transition-colors">
                  {{ proj.title }}
                </h3>
                <p class="text-xs text-slate-300 mt-1 leading-relaxed">
                  {{ proj.description }}
                </p>
              </div>

              <!-- Requirements checklist -->
              <div class="space-y-1.5 pt-2">
                <div class="text-[11px] font-semibold text-slate-400">Вимоги до проекту:</div>
                <ul class="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                  @for (req of proj.requirements; track req) {
                    <li>{{ req }}</li>
                  }
                </ul>
              </div>
            </div>

            <!-- Bottom Action -->
            <div class="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold">
              <span class="text-slate-400 font-mono">Мова: {{ proj.language.toUpperCase() }}</span>
              <button
                (click)="openInIde(proj)"
                class="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-500/20"
              >
                <span>Відкрити в IDE</span>
                <mat-icon class="text-sm">terminal</mat-icon>
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ProjectsCatalogComponent {
  private state = inject(StateService);
  readonly t = this.state.t;
  readonly projects = FINAL_PROJECTS_DATA;
  readonly activeProject = signal<FinalProject>(FINAL_PROJECTS_DATA[0]);

  selectProject(p: FinalProject) {
    this.activeProject.set(p);
  }

  openInIde(p: FinalProject) {
    if (p) {
      this.state.setView('ide');
    }
  }
}
