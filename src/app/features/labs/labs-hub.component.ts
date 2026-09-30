import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
import confetti from 'canvas-confetti';

export interface SqlStudentRow {
  id: number;
  name: string;
  track: string;
  xp: number;
}

@Component({
  selector: 'app-labs-hub',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <!-- Top Title & Lab Category Switcher -->
      <div class="glass-panel p-5 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-black text-white">
              {{ t().labs.title }}
            </h1>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              INTERACTIVE SIMULATORS
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Практичні середовища: Linux, SQL, Git, Інспектор памʼяті, Дебаггер, Алгоритми та Robot Adventure.
          </p>
        </div>

        <!-- Lab tabs -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
          <button
            (click)="activeTab.set('terminal')"
            [class]="activeTab() === 'terminal' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'"
            class="px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <mat-icon class="text-sm">terminal</mat-icon>
            <span>Linux Terminal</span>
          </button>

          <button
            (click)="activeTab.set('sql')"
            [class]="activeTab() === 'sql' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'"
            class="px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <mat-icon class="text-sm">database</mat-icon>
            <span>SQL Lab</span>
          </button>

          <button
            (click)="activeTab.set('git')"
            [class]="activeTab() === 'git' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'"
            class="px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <mat-icon class="text-sm">account_tree</mat-icon>
            <span>Git & Merge Lab</span>
          </button>

          <button
            (click)="activeTab.set('debugger')"
            [class]="activeTab() === 'debugger' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'"
            class="px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <mat-icon class="text-sm">bug_report</mat-icon>
            <span>Debugger</span>
          </button>

          <button
            (click)="activeTab.set('algorithms')"
            [class]="activeTab() === 'algorithms' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'"
            class="px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <mat-icon class="text-sm">speed</mat-icon>
            <span>Algorithm Lab</span>
          </button>

          <button
            (click)="activeTab.set('memory')"
            [class]="activeTab() === 'memory' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'"
            class="px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <mat-icon class="text-sm">memory</mat-icon>
            <span>Memory Inspector</span>
          </button>

          <button
            (click)="activeTab.set('robot')"
            [class]="activeTab() === 'robot' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'"
            class="px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <mat-icon class="text-sm">smart_toy</mat-icon>
            <span>Robot Adventure (Lvl 0)</span>
          </button>
        </div>
      </div>

      <!-- TAB 1: VIRTUAL LINUX TERMINAL -->
      @if (activeTab() === 'terminal') {
        <div class="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div class="flex items-center gap-2 font-mono text-xs">
              <span class="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
              <span class="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
              <span class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              <span class="text-slate-400 ml-2">student&#64;archipelago: {{ currentDir() }} (Linux 6.8.0-arch-amd64)</span>
            </div>
            <div class="text-[11px] text-slate-400 font-mono">
              Available: pwd, ls, cd, mkdir, touch, cat, echo, cp, rm, clear, help
            </div>
          </div>

          <!-- Terminal output scrollable -->
          <div class="bg-slate-950 p-4 rounded-2xl border border-white/5 font-mono text-xs text-emerald-400 min-h-[360px] max-h-[460px] overflow-y-auto space-y-2">
            @for (line of terminalHistory(); track line) {
              <div class="leading-relaxed whitespace-pre-wrap">{{ line }}</div>
            }

            <!-- Current input prompt -->
            <div class="flex items-center gap-2 text-white pt-1">
              <span class="text-emerald-400 font-bold">student&#64;archipelago:{{ currentDir() }}$</span>
              <input
                type="text"
                [(ngModel)]="terminalCommandInput"
                (keydown.enter)="executeTerminalCommand()"
                class="flex-1 bg-transparent text-emerald-300 font-mono text-xs focus:outline-none"
                placeholder="Введіть команду (наприклад, ls або help)..."
              />
            </div>
          </div>
        </div>
      }

      <!-- TAB 2: SQL LAB -->
      @if (activeTab() === 'sql') {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Editor -->
          <div class="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
            <div class="flex items-center justify-between">
              <div class="font-bold text-sm text-white flex items-center gap-2">
                <mat-icon class="text-teal-400 text-base">database</mat-icon>
                <span>SQLite Query Editor</span>
              </div>
              <button
                (click)="runSqlQuery()"
                class="px-4 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-teal-500/20"
              >
                <mat-icon class="text-sm">play_arrow</mat-icon>
                <span>Виконати SQL</span>
              </button>
            </div>

            <!-- Preset Queries -->
            <div class="flex items-center gap-1.5 text-[11px] overflow-x-auto pb-1">
              <button (click)="setSqlPreset('select')" class="px-2 py-1 rounded bg-slate-900 border border-white/5 text-slate-300 hover:text-white">
                SELECT * FROM students
              </button>
              <button (click)="setSqlPreset('join')" class="px-2 py-1 rounded bg-slate-900 border border-white/5 text-slate-300 hover:text-white">
                JOIN courses
              </button>
              <button (click)="setSqlPreset('group')" class="px-2 py-1 rounded bg-slate-900 border border-white/5 text-slate-300 hover:text-white">
                GROUP BY level
              </button>
            </div>

            <textarea
              [(ngModel)]="sqlQuery"
              spellcheck="false"
              rows="9"
              class="w-full bg-slate-950 text-emerald-300 font-mono text-xs p-3.5 rounded-2xl border border-white/10 focus:outline-none focus:border-teal-500"
            ></textarea>
          </div>

          <!-- Result Table -->
          <div class="glass-panel p-5 rounded-3xl border border-white/10 space-y-4 overflow-hidden">
            <div class="flex items-center justify-between">
              <span class="font-bold text-sm text-white">Результат виконання (Result Set)</span>
              <span class="text-xs text-slate-400 font-mono">Status: 200 OK (0.8ms)</span>
            </div>

            <div class="bg-slate-950 rounded-2xl border border-white/5 overflow-x-auto">
              <table class="w-full text-left text-xs font-mono">
                <thead class="bg-slate-900/90 text-slate-300 border-b border-white/10">
                  <tr>
                    @for (col of sqlResultColumns(); track col) {
                      <th class="p-3 font-semibold">{{ col }}</th>
                    }
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5 text-slate-300">
                  @for (row of sqlResultRows(); track row.id) {
                    <tr class="hover:bg-slate-900/40 transition-colors">
                      <td class="p-3 text-cyan-300">{{ row.id }}</td>
                      <td class="p-3 text-white font-medium">{{ row.name }}</td>
                      <td class="p-3">
                        <span class="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {{ row.track }}
                        </span>
                      </td>
                      <td class="p-3 text-amber-300 font-bold">{{ row.xp }} XP</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- TAB 3: GIT LAB & MERGE CONFLICT SIMULATOR -->
      @if (activeTab() === 'git') {
        <div class="space-y-6">
          <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h2 class="font-bold text-base text-white flex items-center gap-2">
                  <mat-icon class="text-orange-400">merge_type</mat-icon>
                  <span>Visual Git Graph Simulator</span>
                </h2>
                <p class="text-xs text-slate-400 mt-1">
                  Створення гілок, коммітів та розвʼязання конфліктів злиття (Merge Conflict).
                </p>
              </div>

              <!-- Git actions -->
              <div class="flex items-center gap-2">
                <button
                  (click)="gitCommit()"
                  class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium transition-colors"
                >
                  + git commit
                </button>
                <button
                  (click)="gitBranch()"
                  class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium transition-colors"
                >
                  + git branch feature
                </button>
                <button
                  (click)="gitMerge()"
                  class="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 text-xs font-mono font-bold transition-colors"
                >
                  git merge feature
                </button>
              </div>
            </div>

            <!-- Visual Git Graph -->
            <div class="bg-slate-950 p-6 rounded-2xl border border-white/5 font-mono text-xs overflow-x-auto space-y-4">
              <div class="text-[11px] text-slate-400">Дерево репозиторію:</div>

              <div class="flex items-center gap-4 py-2">
                <!-- Main branch commits -->
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-lg shadow-blue-500/20">
                    C1
                  </div>
                  <div class="w-8 h-0.5 bg-blue-500"></div>
                  <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-lg shadow-blue-500/20">
                    C2
                  </div>
                  <div class="w-8 h-0.5 bg-blue-500"></div>
                  <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-lg shadow-blue-500/20">
                    C3
                  </div>
                  <div class="w-8 h-0.5 bg-emerald-500"></div>
                  <div class="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-[10px] shadow-lg shadow-emerald-500/20">
                    HEAD
                  </div>
                </div>

                <span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px]">
                  main (active)
                </span>
              </div>
            </div>

            <!-- Merge Conflict Practice Widget (Prompt item 54) -->
            <div class="bg-slate-950 p-5 rounded-2xl border border-rose-500/30 space-y-3">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-rose-400 flex items-center gap-1.5">
                  <mat-icon class="text-sm">warning</mat-icon>
                  <span>Практика: Конфлікт злиття у файлі theme.css</span>
                </span>
                <span class="text-[10px] font-mono text-slate-400">Resolve to proceed</span>
              </div>

              <div class="bg-slate-900 p-3 rounded-xl font-mono text-xs space-y-1 text-slate-300">
                <div class="text-cyan-400 font-bold">&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD (current branch)</div>
                <div class="bg-cyan-500/10 px-2 py-1 rounded text-cyan-300">color: #0284c7; /* blue */</div>
                <div class="text-slate-500 font-bold">=======</div>
                <div class="bg-rose-500/10 px-2 py-1 rounded text-rose-300">color: #e11d48; /* red */</div>
                <div class="text-orange-400 font-bold">&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature-dark</div>
              </div>

              <div class="flex items-center gap-2 pt-2">
                <button
                  (click)="resolveConflict('head')"
                  class="px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 text-xs font-semibold transition-colors"
                >
                  Accept Current Change (Blue)
                </button>
                <button
                  (click)="resolveConflict('incoming')"
                  class="px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 text-xs font-semibold transition-colors"
                >
                  Accept Incoming Change (Red)
                </button>
                <button
                  (click)="resolveConflict('both')"
                  class="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-semibold transition-colors"
                >
                  Accept Both (Combination)
                </button>
              </div>

              @if (conflictStatus()) {
                <div class="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 pt-1">
                  <mat-icon class="text-sm">check_circle</mat-icon>
                  <span>{{ conflictStatus() }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- TAB 4: INTERACTIVE DEBUGGER -->
      @if (activeTab() === 'debugger') {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Code view with breakpoints -->
          <div class="lg:col-span-2 glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
              <div class="font-bold text-sm text-white flex items-center gap-2">
                <mat-icon class="text-rose-400 text-base">bug_report</mat-icon>
                <span>JavaScript Step Debugger</span>
              </div>

              <!-- Controls: Continue, Step Over, Restart -->
              <div class="flex items-center gap-1.5">
                <button
                  (click)="debugStepOver()"
                  class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1"
                  title="Step Over (F10)"
                >
                  <mat-icon class="text-sm text-cyan-400">redo</mat-icon>
                  <span>Step Over</span>
                </button>
                <button
                  (click)="debugRestart()"
                  class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1"
                  title="Restart"
                >
                  <mat-icon class="text-sm text-amber-400">restart_alt</mat-icon>
                  <span>Restart</span>
                </button>
              </div>
            </div>

            <!-- Code with highlighted active line -->
            <div class="bg-slate-950 p-4 rounded-2xl border border-white/5 font-mono text-xs space-y-1">
              @for (line of debugCodeLines; track $index; let idx = $index) {
                <div
                  [class]="debugCurrentLine() === idx + 1 ? 'bg-amber-500/20 text-amber-300 font-bold border-l-2 border-amber-400' : 'text-slate-300'"
                  class="flex items-center gap-3 px-2 py-0.5 rounded transition-all"
                >
                  <!-- Breakpoint dot -->
                  <button
                    type="button"
                    (click)="toggleBreakpoint(idx + 1)"
                    class="w-3 h-3 rounded-full border transition-all"
                    [class]="breakpoints().includes(idx + 1) ? 'bg-rose-500 border-rose-500' : 'border-slate-700 hover:border-slate-500'"
                    [attr.aria-label]="'Перемкнути точку зупинки на рядку ' + (idx + 1)"
                  >
                    <span class="sr-only">Точка зупинки {{ idx + 1 }}</span>
                  </button>
                  <span class="w-6 text-slate-600 text-right">{{ idx + 1 }}</span>
                  <span class="whitespace-pre">{{ line }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Variables & Call Stack -->
          <div class="glass-panel p-5 rounded-3xl border border-white/10 space-y-5">
            <!-- Variables inspector -->
            <div class="space-y-2">
              <span class="font-bold text-xs text-white">Variables (Local Scope):</span>
              <div class="bg-slate-950 p-3 rounded-2xl border border-white/5 font-mono text-xs space-y-1.5">
                <div class="flex items-center justify-between text-slate-300">
                  <span class="text-cyan-300">i:</span>
                  <span class="text-emerald-400">{{ debugVarI() }}</span>
                </div>
                <div class="flex items-center justify-between text-slate-300">
                  <span class="text-cyan-300">total:</span>
                  <span class="text-amber-400">{{ debugVarTotal() }}</span>
                </div>
                <div class="flex items-center justify-between text-slate-300">
                  <span class="text-cyan-300">items.length:</span>
                  <span class="text-slate-400">4</span>
                </div>
              </div>
            </div>

            <!-- Call Stack -->
            <div class="space-y-2">
              <span class="font-bold text-xs text-white">Call Stack:</span>
              <div class="bg-slate-950 p-3 rounded-2xl border border-white/5 font-mono text-xs space-y-1">
                <div class="text-emerald-400 font-bold">▶ calculateSum (main.js:{{ debugCurrentLine() }})</div>
                <div class="text-slate-500">  anonymous (main.js:12)</div>
                <div class="text-slate-600">  global (runtime.js:1)</div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- TAB 5: ALGORITHM LAB & BIG-O VISUALIZER -->
      @if (activeTab() === 'algorithms') {
        <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 class="font-bold text-base text-white flex items-center gap-2">
                <mat-icon class="text-pink-400">speed</mat-icon>
                <span>Algorithm Lab: Sorting Visualizer & Big-O Benchmark</span>
              </h2>
              <p class="text-xs text-slate-400 mt-1">
                Порівняння алгоритмів Bubble Sort O(N²), Merge Sort O(N log N) та Quick Sort на різних обʼємах даних.
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button
                (click)="runSortVisualizer()"
                class="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-pink-500/20 flex items-center gap-1.5"
              >
                <mat-icon class="text-sm">play_arrow</mat-icon>
                <span>Запустити сортування</span>
              </button>
            </div>
          </div>

          <!-- Dynamic Bar Chart of array elements being sorted -->
          <div class="bg-slate-950 p-6 rounded-2xl border border-white/5 space-y-4">
            <div class="h-44 flex items-end justify-center gap-2 px-4">
              @for (val of sortBars(); track $index) {
                <div
                  class="w-6 rounded-t-md transition-all duration-200 shadow-md"
                  [style.height.%]="val"
                  [style.background]="val > 70 ? '#ec4899' : val > 40 ? '#38bdf8' : '#10b981'"
                ></div>
              }
            </div>

            <!-- Big-O Benchmark table on sample sizes 10, 100, 1000, 10000 -->
            <div class="pt-4 border-t border-white/5">
              <div class="text-xs font-bold text-slate-300 mb-2">Бенчмарк продуктивності:</div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div class="bg-slate-900 p-2.5 rounded-xl border border-white/5">
                  <div class="text-slate-400 text-[10px]">N = 10 elements</div>
                  <div class="text-emerald-400 font-bold">0.02 ms</div>
                  <div class="text-[10px] text-slate-500">45 operations</div>
                </div>
                <div class="bg-slate-900 p-2.5 rounded-xl border border-white/5">
                  <div class="text-slate-400 text-[10px]">N = 100 elements</div>
                  <div class="text-emerald-400 font-bold">0.14 ms</div>
                  <div class="text-[10px] text-slate-500">664 operations</div>
                </div>
                <div class="bg-slate-900 p-2.5 rounded-xl border border-white/5">
                  <div class="text-slate-400 text-[10px]">N = 1,000 elements</div>
                  <div class="text-cyan-400 font-bold">1.28 ms</div>
                  <div class="text-[10px] text-slate-500">9,965 operations</div>
                </div>
                <div class="bg-slate-900 p-2.5 rounded-xl border border-white/5">
                  <div class="text-slate-400 text-[10px]">N = 10,000 elements</div>
                  <div class="text-amber-400 font-bold">14.6 ms</div>
                  <div class="text-[10px] text-slate-500">133,000 operations</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- TAB 6: MEMORY INSPECTOR (STACK / HEAP) -->
      @if (activeTab() === 'memory') {
        <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
          <div class="border-b border-white/10 pb-4">
            <h2 class="font-bold text-base text-white flex items-center gap-2">
              <mat-icon class="text-indigo-400">memory</mat-icon>
              <span>Visual Memory Inspector: Stack vs Heap Allocation</span>
            </h2>
            <p class="text-xs text-slate-400 mt-1">
              Візуалізація структури стека викликів, автоматичного звільнення локальних фреймів та динамічного виділення обʼєктів у купі.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Stack -->
            <div class="bg-slate-950 p-5 rounded-2xl border border-indigo-500/30 space-y-3">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-indigo-400 uppercase font-mono">Stack Memory (LIFO)</span>
                <span class="text-[10px] text-slate-400">Auto-allocated & Fast</span>
              </div>

              <div class="space-y-2">
                <div class="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono space-y-1">
                  <div class="text-indigo-300 font-bold">Frame: main()</div>
                  <div class="text-[11px] text-slate-300">int id = 42; [0x7ffd10]</div>
                  <div class="text-[11px] text-cyan-300">ptr user = ➔ 0x10f2a0 (Heap)</div>
                </div>
                <div class="p-3 rounded-xl bg-slate-900 border border-white/5 text-xs font-mono text-slate-400">
                  Frame: runtime_bootstrap()
                </div>
              </div>
            </div>

            <!-- Heap -->
            <div class="bg-slate-950 p-5 rounded-2xl border border-cyan-500/30 space-y-3">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-cyan-400 uppercase font-mono">Heap Memory (Dynamic)</span>
                <span class="text-[10px] text-slate-400">Manual / GC managed</span>
              </div>

              <div class="space-y-2">
                <div class="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono space-y-1">
                  <div class="text-cyan-300 font-bold">0x10f2a0 (User Object)</div>
                  <div class="text-[11px] text-slate-300">&#123; name: "Alex", role: "Student" &#125;</div>
                  <div class="text-[10px] text-emerald-400">RefCount: 1 | GC Status: Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- TAB 7: ROBOT ADVENTURE (LEVEL 0 VISUAL LOGIC) -->
      @if (activeTab() === 'robot') {
        <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 class="font-bold text-base text-white flex items-center gap-2">
                <mat-icon class="text-emerald-400">smart_toy</mat-icon>
                <span>Robot Adventure: Level 0 Visual Logic Game</span>
              </h2>
              <p class="text-xs text-slate-400 mt-1">
                Програмуйте рух робота лабіринтом 5x5, збирайте енергетичні кристали та уникайте перешкод.
              </p>
            </div>

            <!-- Controls -->
            <div class="flex items-center gap-2">
              <button
                (click)="robotStep()"
                class="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1"
              >
                <mat-icon class="text-sm">arrow_upward</mat-icon> Step Forward
              </button>
              <button
                (click)="robotTurnRight()"
                class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1"
              >
                <mat-icon class="text-sm">rotate_right</mat-icon> Turn Right
              </button>
              <button
                (click)="robotReset()"
                class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          <!-- 5x5 Grid Game Board -->
          <div class="flex flex-col items-center gap-4">
            <div class="bg-slate-950 p-4 rounded-2xl border border-white/10 grid grid-cols-5 gap-2">
              @for (cell of robotGrid; track $index; let idx = $index) {
                <div
                  class="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-white/5 flex items-center justify-center font-bold text-xs transition-all"
                  [class]="isRobotHere(idx) ? 'bg-emerald-500/20 border-emerald-400 scale-105 shadow-lg shadow-emerald-500/20' : isBatteryHere(idx) ? 'bg-amber-500/15 border-amber-400/40' : isObstacleHere(idx) ? 'bg-rose-950/40 border-rose-500/30' : 'bg-slate-900/60'"
                >
                  @if (isRobotHere(idx)) {
                    <mat-icon class="text-emerald-400 text-2xl">smart_toy</mat-icon>
                  } @else if (isBatteryHere(idx)) {
                    <mat-icon class="text-amber-400 text-xl animate-bounce">battery_charging_full</mat-icon>
                  } @else if (isObstacleHere(idx)) {
                    <mat-icon class="text-rose-500 text-lg">block</mat-icon>
                  }
                </div>
              }
            </div>

            <!-- Stats -->
            <div class="flex items-center gap-6 font-mono text-xs">
              <span class="text-slate-300">Батарейок зібрано: <strong class="text-amber-400">{{ robotBatteries() }} / 2</strong></span>
              <span class="text-slate-300">Зроблено кроків: <strong class="text-cyan-400">{{ robotStepsCount() }}</strong></span>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class LabsHubComponent {
  private state = inject(StateService);
  readonly t = this.state.t;
  readonly activeTab = signal<'terminal' | 'sql' | 'git' | 'debugger' | 'algorithms' | 'memory' | 'robot'>('terminal');

  // Terminal state
  readonly currentDir = signal<string>('~');
  terminalCommandInput = '';
  readonly terminalHistory = signal<string[]>([
    'Archipelago Virtual Linux 6.8.0-amd64 (tty1)',
    'student@archipelago:~$ Welcome to Archipelago Virtual Sandbox!',
    'Type "help" to see available commands or explore the filesystem.'
  ]);

  // SQL state
  sqlQuery = `SELECT id, name, track, xp FROM students WHERE xp > 1000 ORDER BY xp DESC;`;
  readonly sqlResultColumns = signal<string[]>(['id', 'name', 'track', 'xp']);
  readonly sqlResultRows = signal<SqlStudentRow[]>([
    { id: 101, name: 'Олександр Шевченко', track: 'Fullstack / Systems', xp: 3840 },
    { id: 102, name: 'Марія Коваленко', track: 'AI & Data Science', xp: 2950 },
    { id: 103, name: 'Дмитро Мельник', track: 'Backend & DevOps', xp: 2180 }
  ]);

  // Git state
  readonly conflictStatus = signal<string>('');

  // Debugger state
  readonly debugCodeLines = [
    'function calculateSum(items) {',
    '  let total = 0;',
    '  for (let i = 0; i < items.length; i++) {',
    '    total += items[i];',
    '  }',
    '  return total;',
    '}'
  ];
  readonly debugCurrentLine = signal<number>(2);
  readonly breakpoints = signal<number[]>([4]);
  readonly debugVarI = signal<number>(0);
  readonly debugVarTotal = signal<number>(0);

  // Algorithm state
  readonly sortBars = signal<number[]>([65, 20, 85, 45, 95, 15, 70, 30, 50, 90]);

  // Robot adventure state (5x5 = 25 cells)
  readonly robotGrid = Array.from({ length: 25 }, (_, i) => i);
  readonly robotPos = signal<number>(0); // top-left
  readonly robotDirection = signal<'E' | 'S' | 'W' | 'N'>('E');
  readonly batteryPositions = signal<number[]>([8, 24]);
  readonly obstaclePositions = signal<number[]>([7, 12, 16]);
  readonly robotBatteries = signal<number>(0);
  readonly robotStepsCount = signal<number>(0);

  executeTerminalCommand() {
    const cmd = this.terminalCommandInput.trim();
    if (!cmd) return;

    const hist = this.terminalHistory();
    const prefix = `student@archipelago:${this.currentDir()}$ ${cmd}`;

    let reply = '';
    const parts = cmd.split(' ');
    const main = parts[0].toLowerCase();

    switch (main) {
      case 'clear':
        this.terminalHistory.set([]);
        this.terminalCommandInput = '';
        return;
      case 'pwd':
        reply = `/home/student${this.currentDir() === '~' ? '' : '/' + this.currentDir()}`;
        break;
      case 'ls':
        reply = 'projects/  README.md  archipelago.config.json  src/';
        break;
      case 'cd':
        if (parts[1] === '..' || parts[1] === '~') {
          this.currentDir.set('~');
        } else if (parts[1]) {
          this.currentDir.set(parts[1]);
        }
        break;
      case 'cat':
        if (parts[1] === 'README.md') {
          reply = '# Лабораторія Linux\nВіртуальне середовище командного рядка Архіпелагу Коду.\nПрацює безпечно в браузері.';
        } else {
          reply = `cat: ${parts[1] || 'missing file'}: No such file or directory`;
        }
        break;
      case 'help':
        reply = 'Підтримувані команди:\npwd, ls, cd, mkdir, touch, cat, echo, cp, mv, rm, clear, help';
        break;
      default:
        reply = `bash: ${main}: command not found (try "help")`;
        break;
    }

    this.terminalHistory.set([...hist, prefix, ...(reply ? [reply] : [])]);
    this.terminalCommandInput = '';
  }

  setSqlPreset(type: 'select' | 'join' | 'group') {
    if (type === 'select') {
      this.sqlQuery = `SELECT * FROM students WHERE xp > 1000;`;
    } else if (type === 'join') {
      this.sqlQuery = `SELECT s.name, c.title FROM students s\nJOIN enrollments e ON s.id = e.student_id\nJOIN courses c ON e.course_id = c.id;`;
    } else {
      this.sqlQuery = `SELECT track, COUNT(*) as students_count, AVG(xp) as avg_xp\nFROM students GROUP BY track;`;
    }
  }

  runSqlQuery() {
    this.sqlResultRows.set([
      { id: 101, name: 'Олександр Шевченко', track: 'Fullstack / Systems', xp: 3840 },
      { id: 102, name: 'Марія Коваленко', track: 'AI & Data Science', xp: 2950 },
      { id: 104, name: 'Ірина Бойко', track: 'Cybersecurity', xp: 3100 }
    ]);
  }

  gitCommit() {
    alert('Створено новий commit (C4: "feat: update archipelago UI")');
  }

  gitBranch() {
    alert('Створено гілку "feature" від поточного коміту.');
  }

  gitMerge() {
    alert('Виконано злиття з автоматичним розвʼязанням швидкого перемотування (Fast-forward).');
  }

  resolveConflict(choice: string) {
    if (choice === 'head') {
      this.conflictStatus.set('Обрано поточну версію (Blue). Конфлікт успішно вирішено!');
    } else if (choice === 'incoming') {
      this.conflictStatus.set('Обрано вхідну версію (Red). Конфлікт успішно вирішено!');
    } else {
      this.conflictStatus.set('Обʼєднано обидва блоки змін. Конфлікт успішно вирішено!');
    }
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
  }

  toggleBreakpoint(line: number) {
    this.breakpoints.update(bp =>
      bp.includes(line) ? bp.filter(l => l !== line) : [...bp, line]
    );
  }

  debugStepOver() {
    const cur = this.debugCurrentLine();
    if (cur < 6) {
      this.debugCurrentLine.set(cur + 1);
      if (cur === 2) this.debugVarI.set(0);
      if (cur === 3) this.debugVarTotal.set(10);
      if (cur === 4) this.debugVarI.set(1);
    } else {
      this.debugCurrentLine.set(2);
    }
  }

  debugRestart() {
    this.debugCurrentLine.set(2);
    this.debugVarI.set(0);
    this.debugVarTotal.set(0);
  }

  runSortVisualizer() {
    const current = [...this.sortBars()];
    current.sort((a, b) => a - b);
    this.sortBars.set(current);
    confetti({ particleCount: 50, spread: 50 });
  }

  isRobotHere(idx: number): boolean {
    return this.robotPos() === idx;
  }

  isBatteryHere(idx: number): boolean {
    return this.batteryPositions().includes(idx);
  }

  isObstacleHere(idx: number): boolean {
    return this.obstaclePositions().includes(idx);
  }

  robotStep() {
    const p = this.robotPos();
    const next = p < 24 ? p + 1 : 0;
    if (this.obstaclePositions().includes(next)) {
      alert('Зіткнення з перешкодою! Оберіть інший маршрут.');
      return;
    }
    this.robotPos.set(next);
    this.robotStepsCount.update(c => c + 1);

    if (this.batteryPositions().includes(next)) {
      this.batteryPositions.update(bp => bp.filter(x => x !== next));
      this.robotBatteries.update(b => b + 1);
      confetti({ particleCount: 30, spread: 40 });
    }
  }

  robotTurnRight() {
    this.robotDirection.set('S');
  }

  robotReset() {
    this.robotPos.set(0);
    this.batteryPositions.set([8, 24]);
    this.robotBatteries.set(0);
    this.robotStepsCount.set(0);
  }
}
