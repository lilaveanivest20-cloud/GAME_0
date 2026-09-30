import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { StateService } from '../../core/services/state.service';
import { ExecutionService } from '../../core/services/execution.service';
import { AiMentorService } from '../../core/services/ai-mentor.service';
import { ExecutionResult, ProjectFile } from '../../core/models/ide.model';
import { QuizQuestion } from '../../core/models/archipelago.model';
import confetti from 'canvas-confetti';

export type ConsoleDockMode = 'right' | 'bottom' | 'floating';
export type LayoutPreset = 'default' | 'bottom-console' | 'free-windows';

interface FloatingWindowConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
}

@Component({
  selector: 'app-ide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, FormsModule, NgTemplateOutlet],
  template: `
    <div
      class="h-[calc(100vh-65px)] flex flex-col bg-slate-950 text-slate-100 overflow-hidden relative select-none"
      [class.cursor-col-resize]="activeDrag?.type === 'splitter-left' || activeDrag?.type === 'splitter-right'"
      [class.cursor-row-resize]="activeDrag?.type === 'splitter-bottom'"
    >
      <!-- TOP BAR -->
      <div class="h-11 bg-slate-900 border-b border-white/10 px-4 flex items-center justify-between gap-3 text-xs shrink-0 z-30">
        <!-- Left: Island & Lesson breadcrumb & Progress -->
        <div class="flex items-center gap-2 overflow-hidden">
          <button
            type="button"
            (click)="exitToIsland()"
            class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center"
            title="Назад до острова"
          >
            <mat-icon class="text-base">arrow_back</mat-icon>
          </button>

          <div class="flex items-center gap-1.5 font-mono text-[11px] truncate">
            <span class="text-emerald-400 font-bold">{{ island().name }}</span>
            <span class="text-slate-600">/</span>
            <span class="text-slate-300 truncate max-w-xs">{{ lesson().title }}</span>
          </div>

          <!-- Lesson progress / XP Reward badge -->
          <div class="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-semibold ml-2">
            <mat-icon class="text-xs">military_tech</mat-icon>
            <span>Нагорода: +100 XP</span>
          </div>
        </div>

        <!-- Center: Window Management & Layout Presets ("Двигать окна / Консоль") -->
        <div class="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-xl border border-white/10">
          <span class="text-[10px] text-slate-400 font-medium px-1 hidden sm:inline">Вікна:</span>

          <!-- 3-Column Docked Layout -->
          <button
            type="button"
            (click)="applyLayoutPreset('default')"
            [class]="layoutPreset() === 'default' && consoleMode() === 'right' ? 'bg-emerald-500/20 text-emerald-300 font-bold border-emerald-500/40' : 'text-slate-400 hover:text-white border-transparent'"
            class="px-2 py-0.5 rounded-lg border text-[11px] flex items-center gap-1 transition-all"
            title="Стандартний 3-колонковий вигляд із регулюванням ширини"
          >
            <mat-icon class="text-xs">view_column</mat-icon>
            <span class="hidden md:inline">3 Колонки</span>
          </button>

          <!-- Bottom Console Docked Layout -->
          <button
            type="button"
            (click)="applyLayoutPreset('bottom-console')"
            [class]="consoleMode() === 'bottom' ? 'bg-emerald-500/20 text-emerald-300 font-bold border-emerald-500/40' : 'text-slate-400 hover:text-white border-transparent'"
            class="px-2 py-0.5 rounded-lg border text-[11px] flex items-center gap-1 transition-all"
            title="Консоль знизу під редактором із регулюванням висоти"
          >
            <mat-icon class="text-xs">vertical_align_bottom</mat-icon>
            <span class="hidden md:inline">Консоль знизу</span>
          </button>

          <!-- Free Floating Draggable Windows Mode -->
          <button
            type="button"
            (click)="applyLayoutPreset('free-windows')"
            [class]="consoleMode() === 'floating' ? 'bg-cyan-500/20 text-cyan-300 font-bold border-cyan-500/40' : 'text-slate-400 hover:text-white border-transparent'"
            class="px-2 py-0.5 rounded-lg border text-[11px] flex items-center gap-1 transition-all"
            title="Оконний режим: вільно перетягуйте та змінюйте розмір консолі та AI наставника"
          >
            <mat-icon class="text-xs">open_in_new</mat-icon>
            <span class="hidden sm:inline">Плаваючі вікна</span>
          </button>

          <!-- Reset positions -->
          <button
            type="button"
            (click)="resetWindowPositions()"
            class="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Скинути розміри та позиції вікон"
          >
            <mat-icon class="text-xs">restart_alt</mat-icon>
          </button>
        </div>

        <!-- Right: Actions & AI Drawer trigger -->
        <div class="flex items-center gap-2">
          <!-- Integrity signals badge -->
          <div
            class="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 border border-white/5 text-[10px] font-mono text-slate-400"
            title="Контроль цілісності: перемикання вкладок та вставки"
          >
            <mat-icon class="text-xs text-cyan-400">shield</mat-icon>
            <span>Switches: {{ tabSwitches() }} | Pastes: {{ pasteCount() }}</span>
          </div>

          <!-- AI Mentor Button (Clearly Visible with glowing pulse) -->
          <button
            type="button"
            (click)="toggleAiMentor()"
            [class]="showAiDrawer() || aiFloating().isOpen ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/40' : 'bg-slate-800 hover:bg-slate-700 text-white border border-emerald-500/30'"
            class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold shadow-sm"
            title="Відкрити інтелектуального AI наставника (можна перетягувати)"
          >
            <mat-icon class="text-sm">psychology</mat-icon>
            <span>{{ t().ide.aiMentor }}</span>
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          <!-- Run Code Button -->
          <button
            type="button"
            (click)="executeCode()"
            [disabled]="isExecuting()"
            class="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
          >
            <mat-icon class="text-sm">{{ isExecuting() ? 'hourglass_top' : 'play_arrow' }}</mat-icon>
            <span>{{ isExecuting() ? t().ide.running : t().ide.run }}</span>
          </button>

          <!-- Submit Button -->
          <button
            type="button"
            (click)="submitSolution()"
            class="px-3 py-1 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
          >
            <mat-icon class="text-sm">verified</mat-icon>
            <span>{{ t().ide.submit }}</span>
          </button>
        </div>
      </div>

      <!-- MAIN WORKSPACE -->
      <div class="flex-1 flex overflow-hidden relative">
        <!-- 1. LEFT PANEL: Task, Theory, Knowledge Check, Oracle Hints -->
        <div
          [style.width.px]="leftWidth()"
          class="border-r border-white/10 bg-slate-900/60 flex flex-col shrink-0 overflow-hidden relative transition-[width] duration-75"
        >
          <!-- Left Tabs & Header -->
          <div class="flex items-center justify-between border-b border-white/10 text-xs font-medium bg-slate-900/90 pr-2">
            <div class="flex items-center flex-1">
              <button
                type="button"
                (click)="leftTab.set('task')"
                [class]="leftTab() === 'task' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-800/50' : 'text-slate-400 hover:text-white'"
                class="flex-1 py-2.5 px-2 text-center transition-colors flex items-center justify-center gap-1"
              >
                <mat-icon class="text-sm">assignment</mat-icon>
                <span>Завдання</span>
              </button>

              <button
                type="button"
                (click)="leftTab.set('theory')"
                [class]="leftTab() === 'theory' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-800/50' : 'text-slate-400 hover:text-white'"
                class="flex-1 py-2.5 px-2 text-center transition-colors flex items-center justify-center gap-1"
              >
                <mat-icon class="text-sm">menu_book</mat-icon>
                <span>Теорія</span>
              </button>

              <button
                type="button"
                (click)="leftTab.set('oracle')"
                [class]="leftTab() === 'oracle' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-800/50' : 'text-slate-400 hover:text-white'"
                class="flex-1 py-2.5 px-2 text-center transition-colors flex items-center justify-center gap-1"
              >
                <mat-icon class="text-sm">auto_fix_high</mat-icon>
                <span>Oracle</span>
              </button>
            </div>
          </div>

          <!-- Left Content Scrollable -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4 text-xs select-text">
            @if (leftTab() === 'task') {
              <div class="space-y-4">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Рівень {{ lesson().level }}
                    </span>
                    <span class="text-[11px] text-slate-400 font-mono">
                      {{ island().difficulty.toUpperCase() }}
                    </span>
                  </div>
                  <h3 class="text-base font-bold text-white">{{ lesson().title }}</h3>
                  <p class="text-slate-300 mt-1 leading-relaxed">{{ lesson().objective }}</p>
                </div>

                <!-- Step by step instructions -->
                <div class="bg-slate-900 p-3 rounded-xl border border-white/5 space-y-2">
                  <div class="font-bold text-cyan-400 flex items-center gap-1">
                    <mat-icon class="text-sm">format_list_numbered</mat-icon>
                    <span>Покрокова інструкція:</span>
                  </div>
                  <div class="space-y-1.5">
                    @for (step of lesson().stepByStep; track step) {
                      <div class="text-slate-300 leading-relaxed bg-slate-950/60 p-2 rounded-lg border border-white/5">
                        {{ step }}
                      </div>
                    }
                  </div>
                </div>

                <!-- Knowledge Check Quiz -->
                @if (lesson().knowledgeCheck.length > 0) {
                  <div class="bg-slate-900 p-3.5 rounded-xl border border-white/5 space-y-3">
                    <div class="font-bold text-amber-400 flex items-center gap-1">
                      <mat-icon class="text-sm">quiz</mat-icon>
                      <span>Knowledge Check (Самоперевірка):</span>
                    </div>

                    @for (q of lesson().knowledgeCheck; track q.id; let qIdx = $index) {
                      <div class="bg-slate-950 p-3 rounded-xl border border-white/5 space-y-2">
                        <div class="font-semibold text-white">
                          {{ qIdx + 1 }}. {{ q.question }}
                        </div>

                        @if (q.codeSnippet) {
                          <pre class="bg-slate-900 p-2 rounded text-[11px] font-mono text-emerald-300 border border-white/5 overflow-x-auto">{{ q.codeSnippet }}</pre>
                        }

                        <div class="space-y-1 pt-1">
                          @for (opt of q.options; track opt; let optIdx = $index) {
                            <button
                              type="button"
                              (click)="selectQuizAnswer(q.id, optIdx)"
                              [class]="quizAnswerState(q, optIdx)"
                              class="w-full text-left p-2 rounded-lg text-[11px] border transition-all flex items-center gap-2"
                            >
                              <span class="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[10px]">
                                {{ optIdx + 1 }}
                              </span>
                              <span>{{ opt }}</span>
                            </button>
                          }
                        </div>

                        @if (quizAnswers()[q.id] !== undefined) {
                          <div class="text-[11px] text-slate-400 italic pt-1 border-t border-white/5">
                            💡 {{ q.explanation }}
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            }

            @if (leftTab() === 'theory') {
              <div class="space-y-4">
                <div class="prose prose-invert max-w-none text-xs leading-relaxed text-slate-300">
                  <div class="whitespace-pre-line">{{ lesson().theory }}</div>
                </div>

                @if (lesson().visualExplanation) {
                  <div class="bg-slate-950 p-3 rounded-xl border border-emerald-500/20 space-y-2">
                    <div class="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <mat-icon class="text-xs">visibility</mat-icon>
                      <span>Візуальна схема та ментальна модель:</span>
                    </div>
                    <pre class="font-mono text-[10px] sm:text-[11px] text-emerald-300/90 bg-slate-900/90 p-2.5 rounded-lg border border-white/5 overflow-x-auto whitespace-pre">{{ lesson().visualExplanation }}</pre>
                  </div>
                }

                @if (lesson().codeExample) {
                  <div class="space-y-1.5">
                    <div class="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                      <mat-icon class="text-xs text-amber-400">code</mat-icon>
                      <span>Приклад реалізації:</span>
                    </div>
                    <pre class="font-mono text-[11px] text-slate-200 bg-slate-950 p-3 rounded-xl border border-white/10 overflow-x-auto">{{ lesson().codeExample }}</pre>
                  </div>
                }
              </div>
            }

            @if (leftTab() === 'oracle') {
              <div class="space-y-4">
                <div class="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 p-3.5 rounded-xl border border-emerald-500/30">
                  <h4 class="font-bold text-emerald-400 flex items-center gap-1.5">
                    <mat-icon class="text-sm">auto_fix_high</mat-icon>
                    <span>{{ t().ide.oracleTitle }}</span>
                  </h4>
                  <p class="text-[11px] text-slate-300 mt-1">
                    {{ t().ide.oracleDesc }}. Використання вищих рівнів підказок знижує бали за самостійність.
                  </p>
                </div>

                <!-- Tier 1: Concept -->
                <div class="bg-slate-900 p-3 rounded-xl border border-white/5 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-slate-200">{{ t().ide.conceptHint }}</span>
                    <button
                      type="button"
                      (click)="revealHint(1)"
                      class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                    >
                      {{ revealedHintLevel() >= 1 ? 'Відкрито' : 'Показати' }}
                    </button>
                  </div>
                  @if (revealedHintLevel() >= 1) {
                    <p class="text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-emerald-500/20 text-[11px]">
                      {{ lesson().oracleConcept }}
                    </p>
                  }
                </div>

                <!-- Tier 2: Pseudocode -->
                <div class="bg-slate-900 p-3 rounded-xl border border-white/5 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-slate-200">{{ t().ide.pseudocodeHint }}</span>
                    <button
                      type="button"
                      (click)="revealHint(2)"
                      class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                    >
                      {{ revealedHintLevel() >= 2 ? 'Відкрито' : 'Показати' }}
                    </button>
                  </div>
                  @if (revealedHintLevel() >= 2) {
                    <pre class="font-mono text-[10px] text-amber-300 bg-slate-950 p-2.5 rounded-lg border border-amber-500/20 whitespace-pre overflow-x-auto">{{ lesson().oraclePseudocode }}</pre>
                  }
                </div>

                <!-- Tier 3: Full Solution -->
                <div class="bg-slate-900 p-3 rounded-xl border border-white/5 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-slate-200">{{ t().ide.solutionHint }}</span>
                    <button
                      type="button"
                      (click)="revealHint(3)"
                      class="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
                    >
                      {{ revealedHintLevel() >= 3 ? 'Відкрито' : 'Показати (-30% XP)' }}
                    </button>
                  </div>
                  @if (revealedHintLevel() >= 3) {
                    <div class="space-y-2">
                      <pre class="font-mono text-[11px] text-rose-300 bg-slate-950 p-2.5 rounded-lg border border-rose-500/20 overflow-x-auto">{{ lesson().oracleSolution }}</pre>
                      <button
                        type="button"
                        (click)="applySolution()"
                        class="w-full py-1.5 rounded-lg bg-rose-600/30 text-rose-300 hover:bg-rose-600/50 font-bold text-[10px] transition-colors"
                      >
                        Вставити розвʼязок у редактор
                      </button>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- DRAGGABLE SPLITTER: Left Panel <-> Editor -->
        <div
          (mousedown)="startSplitterDrag('splitter-left', $event)"
          (touchstart)="startSplitterDragTouch('splitter-left', $event)"
          class="w-1.5 hover:w-2 bg-slate-900 hover:bg-emerald-500/60 active:bg-emerald-500 cursor-col-resize transition-all duration-150 shrink-0 z-20 flex items-center justify-center group"
          title="Потягніть мишкою, щоб змінити ширину панелі завдань"
        >
          <div class="w-0.5 h-8 bg-slate-600 group-hover:bg-white rounded-full"></div>
        </div>

        <!-- 2. CENTER PANEL: Code Editor & Optional Bottom Console -->
        <div class="flex-1 flex flex-col bg-slate-950 overflow-hidden min-w-[280px]">
          <!-- Top Editor Tabs & Tools -->
          <div class="h-9 bg-slate-900/90 border-b border-white/10 px-2 flex items-center justify-between gap-2 overflow-x-auto shrink-0 select-none">
            <div class="flex items-center gap-1">
              @for (file of projectFiles(); track file.id) {
                <button
                  type="button"
                  (click)="activeFileId.set(file.id)"
                  [class]="activeFileId() === file.id ? 'bg-slate-950 text-emerald-400 border-t-2 border-emerald-400 font-semibold' : 'text-slate-400 hover:text-white bg-slate-900'"
                  class="px-3 py-1.5 rounded-t-lg text-xs font-mono flex items-center gap-1.5 transition-colors border-x border-white/5"
                >
                  <mat-icon class="text-xs">
                    {{ file.name.endsWith('.ts') || file.name.endsWith('.js') ? 'code' : 'description' }}
                  </mat-icon>
                  <span>{{ file.name }}</span>
                </button>
              }
            </div>

            <!-- Quick Action controls -->
            <div class="flex items-center gap-1 text-slate-400 text-xs">
              <!-- Detach / Float Console Quick Trigger -->
              @if (consoleMode() !== 'floating') {
                <button
                  type="button"
                  (click)="setConsoleMode('floating')"
                  class="px-2 py-1 rounded hover:text-emerald-400 hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px]"
                  title="Відстикувати консоль у вільне плаваюче вікно (можна вільно рухати)"
                >
                  <mat-icon class="text-xs">open_in_new</mat-icon>
                  <span class="hidden sm:inline">Двигати консоль</span>
                </button>
              }

              <button
                type="button"
                (click)="resetToTemplate()"
                class="p-1 rounded hover:text-white hover:bg-slate-800 transition-colors"
                title="Скинути до чистого шаблону"
              >
                <mat-icon class="text-sm">restart_alt</mat-icon>
              </button>
            </div>
          </div>

          <!-- Code Editor Body (flex-1) -->
          <div class="flex-1 flex overflow-hidden relative">
            <!-- Line Numbers -->
            <div class="w-12 bg-slate-950/90 text-right pr-3 pt-3 font-mono text-xs text-slate-600 select-none border-r border-white/5">
              @for (line of lineNumbers(); track line) {
                <div class="leading-6">{{ line }}</div>
              }
            </div>

            <!-- Code Input Textarea -->
            <div class="flex-1 relative h-full">
              <textarea
                [ngModel]="currentFile().content"
                (ngModelChange)="onCodeChange($event)"
                (paste)="onPaste()"
                spellcheck="false"
                class="w-full h-full bg-slate-950 text-slate-100 p-3 font-mono text-xs sm:text-sm leading-6 resize-none focus:outline-none selection:bg-emerald-500/30 selection:text-emerald-200"
                placeholder="// Напишіть ваш код тут..."
              ></textarea>
            </div>
          </div>

          <!-- Bottom Status Bar -->
          <div class="h-6 bg-slate-900 border-t border-white/10 px-3 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none shrink-0">
            <div class="flex items-center gap-3">
              <span>Lines: {{ lineNumbers().length }}</span>
              <span>Encoding: UTF-8</span>
              <span>Lang: {{ currentFile().language.toUpperCase() }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-emerald-400">Spaces: 2</span>
              <span>LF</span>
              <span class="text-slate-500">Консоль: {{ consoleModeLabel() }}</span>
            </div>
          </div>

          <!-- BOTTOM DOCKED CONSOLE (Active if consoleMode === 'bottom') -->
          @if (consoleMode() === 'bottom') {
            <!-- DRAGGABLE SPLITTER: Editor <-> Bottom Console -->
            <div
              (mousedown)="startSplitterDrag('splitter-bottom', $event)"
              (touchstart)="startSplitterDragTouch('splitter-bottom', $event)"
              class="h-1.5 hover:h-2 bg-slate-900 hover:bg-emerald-500/60 active:bg-emerald-500 cursor-row-resize transition-all duration-150 shrink-0 z-20 flex items-center justify-center group"
              title="Потягніть мишкою вгору чи вниз, щоб змінити висоту консолі"
            >
              <div class="h-0.5 w-12 bg-slate-600 group-hover:bg-white rounded-full"></div>
            </div>

            <div
              [style.height.px]="bottomHeight()"
              class="bg-slate-900/90 border-t border-white/10 flex flex-col shrink-0 overflow-hidden relative"
            >
              <!-- Console Top bar -->
              <ng-container *ngTemplateOutlet="consoleHeaderTemplate"></ng-container>

              <!-- Console Body -->
              <div class="flex-1 overflow-y-auto p-3 font-mono text-xs select-text">
                <ng-container *ngTemplateOutlet="consoleContentTemplate"></ng-container>
              </div>
            </div>
          }
        </div>

        <!-- 3. RIGHT DOCKED PANEL: Active if consoleMode === 'right' -->
        @if (consoleMode() === 'right') {
          <!-- DRAGGABLE SPLITTER: Editor <-> Right Panel -->
          <div
            (mousedown)="startSplitterDrag('splitter-right', $event)"
            (touchstart)="startSplitterDragTouch('splitter-right', $event)"
            class="w-1.5 hover:w-2 bg-slate-900 hover:bg-emerald-500/60 active:bg-emerald-500 cursor-col-resize transition-all duration-150 shrink-0 z-20 flex items-center justify-center group"
            title="Потягніть мишкою ліворуч чи праворуч, щоб змінити ширину панелі консолі"
          >
            <div class="w-0.5 h-8 bg-slate-600 group-hover:bg-white rounded-full"></div>
          </div>

          <div
            [style.width.px]="rightWidth()"
            class="border-l border-white/10 bg-slate-900/60 flex flex-col shrink-0 overflow-hidden relative transition-[width] duration-75"
          >
            <!-- Console Header -->
            <ng-container *ngTemplateOutlet="consoleHeaderTemplate"></ng-container>

            <!-- Console Content -->
            <div class="flex-1 overflow-y-auto p-3.5 space-y-3 font-mono text-xs select-text">
              <ng-container *ngTemplateOutlet="consoleContentTemplate"></ng-container>
            </div>
          </div>
        }

        <!-- 4. RIGHT DOCKED AI DRAWER (If open and not floating) -->
        @if (showAiDrawer() && !aiFloating().isFloating) {
          <div class="w-80 lg:w-96 border-l border-white/10 bg-slate-900 flex flex-col shrink-0 shadow-2xl z-20 animate-fade-in">
            <ng-container *ngTemplateOutlet="aiMentorContentTemplate"></ng-container>
          </div>
        }
      </div>

      <!-- ========================================================= -->
      <!-- 5. FLOATING DRAGGABLE CONSOLE WINDOW ("Двигать консоль")   -->
      <!-- ========================================================= -->
      @if (consoleMode() === 'floating' && !consoleFloating().minimized) {
        <div
          [style.left.px]="consoleFloating().maximized ? 0 : consoleFloating().x"
          [style.top.px]="consoleFloating().maximized ? 44 : consoleFloating().y"
          [style.width.px]="consoleFloating().maximized ? '100%' : consoleFloating().width"
          [style.height.px]="consoleFloating().maximized ? 'calc(100vh - 110px)' : consoleFloating().height"
          [style.z-index]="consoleFloating().zIndex"
          (mousedown)="bringWindowToFront('console')"
          class="fixed rounded-2xl bg-slate-950/95 border border-cyan-500/40 shadow-2xl shadow-cyan-500/10 flex flex-col overflow-hidden backdrop-blur-md transition-[box-shadow] duration-200"
        >
          <!-- Draggable Window Titlebar -->
          <div
            (mousedown)="startWindowDrag('console', $event)"
            (touchstart)="startWindowDragTouch('console', $event)"
            class="h-10 bg-slate-900/90 border-b border-white/10 px-3 flex items-center justify-between gap-2 cursor-move select-none shrink-0"
            title="Затисніть ліву кнопку миші, щоб перетягнути вікно консолі в будь-яке місце екрану"
          >
            <!-- Window Title & Drag Indicator -->
            <div class="flex items-center gap-2 text-xs font-bold text-white">
              <mat-icon class="text-cyan-400 text-sm">drag_indicator</mat-icon>
              <div class="flex items-center gap-1.5">
                <mat-icon class="text-emerald-400 text-xs">terminal</mat-icon>
                <span>Консоль & Тести</span>
              </div>
              <span class="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono font-normal">
                ПЛАВАЮЧЕ ВІКНО
              </span>
            </div>

            <!-- Window Header Controls: Dock, Min, Max, Close -->
            <div class="flex items-center gap-1" (mousedown)="$event.stopPropagation()">
              <!-- Dock Right -->
              <button
                type="button"
                (click)="setConsoleMode('right')"
                class="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Пристикувати праворуч"
              >
                <mat-icon class="text-xs">view_sidebar</mat-icon>
              </button>

              <!-- Dock Bottom -->
              <button
                type="button"
                (click)="setConsoleMode('bottom')"
                class="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Пристикувати знизу"
              >
                <mat-icon class="text-xs">vertical_align_bottom</mat-icon>
              </button>

              <!-- Minimize -->
              <button
                type="button"
                (click)="minimizeWindow('console')"
                class="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Згорнути в панель"
              >
                <mat-icon class="text-xs">minimize</mat-icon>
              </button>

              <!-- Maximize / Restore -->
              <button
                type="button"
                (click)="toggleMaximizeWindow('console')"
                class="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Розгорнути на весь екран"
              >
                <mat-icon class="text-xs">{{ consoleFloating().maximized ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon>
              </button>

              <!-- Close -->
              <button
                type="button"
                (click)="setConsoleMode('right')"
                class="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Повернути до стандартного виду"
              >
                <mat-icon class="text-xs">close</mat-icon>
              </button>
            </div>
          </div>

          <!-- Console Tabs Bar -->
          <ng-container *ngTemplateOutlet="consoleTabsTemplate"></ng-container>

          <!-- Console Window Content -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs select-text">
            <ng-container *ngTemplateOutlet="consoleContentTemplate"></ng-container>
          </div>

          <!-- Bottom Right Corner Resize Grip -->
          @if (!consoleFloating().maximized) {
            <div
              (mousedown)="startWindowResize('console', $event)"
              (touchstart)="startWindowResizeTouch('console', $event)"
              class="absolute bottom-1 right-1 w-4 h-4 cursor-se-resize flex items-end justify-end text-slate-500 hover:text-cyan-400 select-none"
              title="Потягніть для зміни розміру вікна"
            >
              <mat-icon class="text-xs leading-none">south_east</mat-icon>
            </div>
          }
        </div>
      }

      <!-- ========================================================= -->
      <!-- 6. FLOATING DRAGGABLE AI MENTOR WINDOW ("AI Наставник")    -->
      <!-- ========================================================= -->
      @if (aiFloating().isOpen && aiFloating().isFloating && !aiFloating().minimized) {
        <div
          [style.left.px]="aiFloating().maximized ? 0 : aiFloating().x"
          [style.top.px]="aiFloating().maximized ? 44 : aiFloating().y"
          [style.width.px]="aiFloating().maximized ? '100%' : aiFloating().width"
          [style.height.px]="aiFloating().maximized ? 'calc(100vh - 110px)' : aiFloating().height"
          [style.z-index]="aiFloating().zIndex"
          (mousedown)="bringWindowToFront('ai')"
          class="fixed rounded-2xl bg-slate-950/95 border border-emerald-500/40 shadow-2xl shadow-emerald-500/10 flex flex-col overflow-hidden backdrop-blur-md transition-[box-shadow] duration-200"
        >
          <!-- Draggable Window Titlebar -->
          <div
            (mousedown)="startWindowDrag('ai', $event)"
            (touchstart)="startWindowDragTouch('ai', $event)"
            class="h-10 bg-slate-900/90 border-b border-white/10 px-3 flex items-center justify-between gap-2 cursor-move select-none shrink-0"
            title="Затисніть мишу для переміщення вікна AI Наставника"
          >
            <div class="flex items-center gap-2 text-xs font-bold text-white">
              <mat-icon class="text-emerald-400 text-sm">drag_indicator</mat-icon>
              <div class="flex items-center gap-1.5">
                <mat-icon class="text-emerald-400 text-xs">psychology</mat-icon>
                <span>AI Наставник & Код-Ревʼю</span>
              </div>
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            <div class="flex items-center gap-1" (mousedown)="$event.stopPropagation()">
              <!-- Dock as Right Drawer -->
              <button
                type="button"
                (click)="dockAiMentorAsDrawer()"
                class="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Пристикувати панель праворуч"
              >
                <mat-icon class="text-xs">dock</mat-icon>
              </button>

              <!-- Minimize -->
              <button
                type="button"
                (click)="minimizeWindow('ai')"
                class="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Згорнути"
              >
                <mat-icon class="text-xs">minimize</mat-icon>
              </button>

              <!-- Maximize / Restore -->
              <button
                type="button"
                (click)="toggleMaximizeWindow('ai')"
                class="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Розгорнути на весь екран"
              >
                <mat-icon class="text-xs">{{ aiFloating().maximized ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon>
              </button>

              <!-- Close -->
              <button
                type="button"
                (click)="closeAiMentor()"
                class="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Закрити"
              >
                <mat-icon class="text-xs">close</mat-icon>
              </button>
            </div>
          </div>

          <!-- AI Mentor Window Content -->
          <div class="flex-1 flex flex-col overflow-hidden">
            <ng-container *ngTemplateOutlet="aiMentorContentTemplate"></ng-container>
          </div>

          <!-- Bottom Right Corner Resize Grip -->
          @if (!aiFloating().maximized) {
            <div
              (mousedown)="startWindowResize('ai', $event)"
              (touchstart)="startWindowResizeTouch('ai', $event)"
              class="absolute bottom-1 right-1 w-4 h-4 cursor-se-resize flex items-end justify-end text-slate-500 hover:text-emerald-400 select-none"
              title="Потягніть для зміни розміру вікна"
            >
              <mat-icon class="text-xs leading-none">south_east</mat-icon>
            </div>
          }
        </div>
      }

      <!-- ========================================================= -->
      <!-- 7. BOTTOM MINIMIZED WINDOW TRAY / DOCK                     -->
      <!-- ========================================================= -->
      @if (consoleFloating().minimized || aiFloating().minimized) {
        <div class="fixed bottom-4 left-6 z-40 flex items-center gap-2 bg-slate-900/90 border border-white/10 px-3 py-1.5 rounded-2xl shadow-2xl backdrop-blur-md">
          <span class="text-[10px] text-slate-400 font-medium">Згорнуті вікна:</span>

          @if (consoleFloating().minimized) {
            <button
              type="button"
              (click)="restoreWindow('console')"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs border border-cyan-500/30 transition-all shadow-md"
            >
              <mat-icon class="text-xs">terminal</mat-icon>
              <span>Консоль</span>
            </button>
          }

          @if (aiFloating().minimized) {
            <button
              type="button"
              (click)="restoreWindow('ai')"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs border border-emerald-500/30 transition-all shadow-md"
            >
              <mat-icon class="text-xs">psychology</mat-icon>
              <span>AI Наставник</span>
            </button>
          }
        </div>
      }

      <!-- ========================================================= -->
      <!-- 8. PERSISTENT FLOATING AI MENTOR ORB (Bottom-Right)        -->
      <!-- ========================================================= -->
      <div class="fixed bottom-4 right-4 z-40 flex items-center gap-2">
        <button
          type="button"
          (click)="toggleAiMentor()"
          class="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all border border-white/20 group"
          title="Натисніть для відкриття інтелектуального помічника AI Наставника"
        >
          <div class="w-6 h-6 rounded-full bg-slate-950/90 text-emerald-400 flex items-center justify-center shadow-inner">
            <mat-icon class="text-sm">psychology</mat-icon>
          </div>
          <span>AI Наставник</span>
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse border border-slate-950"></span>
        </button>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- REUSABLE TEMPLATES                                        -->
    <!-- ========================================================= -->

    <!-- Console Header Bar Template -->
    <ng-template #consoleHeaderTemplate>
      <div class="flex items-center justify-between border-b border-white/10 text-xs font-medium bg-slate-900/90 pr-2 select-none">
        <div class="flex items-center flex-1">
          <button
            type="button"
            (click)="rightTab.set('tests')"
            [class]="rightTab() === 'tests' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-800/50 font-bold' : 'text-slate-400 hover:text-white'"
            class="flex-1 py-2 px-3 text-center transition-colors flex items-center justify-center gap-1"
          >
            <mat-icon class="text-sm">fact_check</mat-icon>
            <span>Тести ({{ lesson().testCases.length }})</span>
          </button>

          <button
            type="button"
            (click)="rightTab.set('terminal')"
            [class]="rightTab() === 'terminal' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-800/50 font-bold' : 'text-slate-400 hover:text-white'"
            class="flex-1 py-2 px-3 text-center transition-colors flex items-center justify-center gap-1"
          >
            <mat-icon class="text-sm">terminal</mat-icon>
            <span>Консоль</span>
          </button>

          <button
            type="button"
            (click)="rightTab.set('variables')"
            [class]="rightTab() === 'variables' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-800/50 font-bold' : 'text-slate-400 hover:text-white'"
            class="flex-1 py-2 px-3 text-center transition-colors flex items-center justify-center gap-1"
          >
            <mat-icon class="text-sm">memory</mat-icon>
            <span>Памʼять</span>
          </button>
        </div>

        <!-- Window Docking & Floating Mode Buttons -->
        <div class="flex items-center gap-1 pl-2">
          <!-- Float Window Button -->
          @if (consoleMode() !== 'floating') {
            <button
              type="button"
              (click)="setConsoleMode('floating')"
              class="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
              title="Відстикувати консоль у вільне вікно, яке можна перетягувати будь-куди"
            >
              <mat-icon class="text-xs">open_in_new</mat-icon>
            </button>
          }

          @if (consoleMode() === 'right') {
            <button
              type="button"
              (click)="setConsoleMode('bottom')"
              class="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Перемістити консоль знизу"
            >
              <mat-icon class="text-xs">vertical_align_bottom</mat-icon>
            </button>
          }

          @if (consoleMode() === 'bottom') {
            <button
              type="button"
              (click)="setConsoleMode('right')"
              class="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Перемістити консоль праворуч"
            >
              <mat-icon class="text-xs">view_sidebar</mat-icon>
            </button>
          }
        </div>
      </div>
    </ng-template>

    <!-- Console Tabs Template for Floating Window -->
    <ng-template #consoleTabsTemplate>
      <div class="flex items-center border-b border-white/10 text-xs font-medium bg-slate-900/90 select-none">
        <button
          type="button"
          (click)="rightTab.set('tests')"
          [class]="rightTab() === 'tests' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-800/50 font-bold' : 'text-slate-400 hover:text-white'"
          class="flex-1 py-2 px-3 text-center transition-colors flex items-center justify-center gap-1"
        >
          <mat-icon class="text-sm">fact_check</mat-icon>
          <span>Тести ({{ lesson().testCases.length }})</span>
        </button>

        <button
          type="button"
          (click)="rightTab.set('terminal')"
          [class]="rightTab() === 'terminal' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-800/50 font-bold' : 'text-slate-400 hover:text-white'"
          class="flex-1 py-2 px-3 text-center transition-colors flex items-center justify-center gap-1"
        >
          <mat-icon class="text-sm">terminal</mat-icon>
          <span>Консоль</span>
        </button>

        <button
          type="button"
          (click)="rightTab.set('variables')"
          [class]="rightTab() === 'variables' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-800/50 font-bold' : 'text-slate-400 hover:text-white'"
          class="flex-1 py-2 px-3 text-center transition-colors flex items-center justify-center gap-1"
        >
          <mat-icon class="text-sm">memory</mat-icon>
          <span>Памʼять</span>
        </button>
      </div>
    </ng-template>

    <!-- Console Content Template -->
    <ng-template #consoleContentTemplate>
      @if (rightTab() === 'tests') {
        <div class="space-y-2.5">
          <!-- Summary banner -->
          @if (executionResult(); as res) {
            <div
              [class]="res.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'"
              class="p-3 rounded-xl border text-xs flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <mat-icon class="text-base">
                  {{ res.status === 'success' ? 'check_circle' : 'cancel' }}
                </mat-icon>
                <span class="font-bold">
                  {{ res.status === 'success' ? t().ide.allTestsPassed : t().ide.someTestsFailed }}
                </span>
              </div>
              <span class="text-[10px] font-mono">
                {{ res.executionTimeMs }}ms
              </span>
            </div>
          }

          <!-- Test Cases List -->
          @for (tc of lesson().testCases; track tc.id; let idx = $index) {
            <div class="bg-slate-950 p-3 rounded-xl border border-white/5 space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-200">
                  Тест {{ idx + 1 }}: {{ tc.title }}
                </span>
                @if (tc.hidden) {
                  <span class="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400">HIDDEN</span>
                }
              </div>

              <div class="text-[11px] text-slate-400">
                <div>Input: <span class="text-cyan-300">{{ tc.input }}</span></div>
                <div>Expected: <span class="text-emerald-300">{{ tc.expected }}</span></div>
              </div>
            </div>
          }
        </div>
      }

      @if (rightTab() === 'terminal') {
        <div class="space-y-2">
          <div class="flex items-center justify-between pb-1 border-b border-white/5 text-[11px] text-slate-400">
            <span>Standard Output (stdout)</span>
            <button type="button" (click)="clearOutput()" class="hover:text-white">Очистити</button>
          </div>

          <pre class="bg-slate-950 p-3 rounded-xl border border-white/5 text-[11px] text-emerald-400 leading-relaxed overflow-x-auto whitespace-pre-wrap min-h-[140px]">{{ executionResult()?.stdout || 'Terminal ready. Click [Run Code] to execute.' }}</pre>

          @if (executionResult()?.stderr) {
            <div class="space-y-1">
              <span class="text-rose-400 font-bold text-[11px]">Standard Error (stderr):</span>
              <pre class="bg-rose-950/30 p-2.5 rounded-xl border border-rose-500/20 text-[11px] text-rose-300 overflow-x-auto">{{ executionResult()?.stderr }}</pre>
            </div>
          }

          @if (executionResult()?.sandboxInfo; as sb) {
            <div class="text-[10px] text-slate-500 bg-slate-950 p-2 rounded-lg border border-white/5">
              <div>Mode: {{ sb.mode }}</div>
              <div>Arch: {{ sb.architecture }}</div>
            </div>
          }
        </div>
      }

      @if (rightTab() === 'variables') {
        <div class="space-y-3">
          <div class="text-[11px] text-slate-400">Інспектор оперативної памʼяті:</div>
          <div class="bg-slate-950 rounded-xl border border-white/5 overflow-hidden">
            <table class="w-full text-left text-[11px]">
              <thead class="bg-slate-900/80 text-slate-400 border-b border-white/5">
                <tr>
                  <th class="p-2">Name</th>
                  <th class="p-2">Value</th>
                  <th class="p-2">Type</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr>
                  <td class="p-2 text-cyan-300">executionTime</td>
                  <td class="p-2 text-emerald-300">{{ executionResult()?.executionTimeMs || 0 }}ms</td>
                  <td class="p-2 text-slate-400">number</td>
                </tr>
                <tr>
                  <td class="p-2 text-cyan-300">memoryAllocated</td>
                  <td class="p-2 text-amber-300">{{ executionResult()?.memoryMb || 8.4 }} MB</td>
                  <td class="p-2 text-slate-400">heap</td>
                </tr>
                <tr>
                  <td class="p-2 text-cyan-300">integrityScore</td>
                  <td class="p-2 text-emerald-300">98%</td>
                  <td class="p-2 text-slate-400">security</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      }
    </ng-template>

    <!-- AI Mentor Content Template -->
    <ng-template #aiMentorContentTemplate>
      <!-- AI Header (Only used when docked) -->
      @if (!aiFloating().isFloating) {
        <div class="h-11 border-b border-white/10 px-4 flex items-center justify-between text-xs font-bold text-white bg-slate-950 shrink-0">
          <div class="flex items-center gap-2">
            <mat-icon class="text-emerald-400 text-sm">psychology</mat-icon>
            <span>AI Mentor & Code Review</span>
          </div>

          <div class="flex items-center gap-1">
            <!-- Float AI Window -->
            <button
              type="button"
              (click)="floatAiMentorWindow()"
              class="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Відстикувати у вільне переміщуване вікно"
            >
              <mat-icon class="text-xs">open_in_new</mat-icon>
            </button>
            <button
              type="button"
              (click)="closeAiMentor()"
              class="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <mat-icon class="text-sm">close</mat-icon>
            </button>
          </div>
        </div>
      }

      <!-- AI Body -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4 text-xs select-text">
        <!-- Quick prompts -->
        <div class="space-y-1.5">
          <div class="text-[11px] text-slate-400 font-semibold">Швидкі запити до Наставника:</div>
          <div class="flex flex-wrap gap-1.5">
            <button
              type="button"
              (click)="askAi('Поясни логіку завдання простими словами, як для початківця')"
              class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
            >
              Поясни логіку
            </button>
            <button
              type="button"
              (click)="requestCodeReview()"
              class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
            >
              Зроби Код-Ревʼю
            </button>
            <button
              type="button"
              (click)="askAi('Яка часова та просторова складність мого алгоритму (Big-O)?')"
              class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
            >
              Оціни складність
            </button>
          </div>
        </div>

        <!-- AI Output message bubble -->
        <div class="bg-slate-950 p-3.5 rounded-2xl border border-emerald-500/20 space-y-2">
          <div class="flex items-center justify-between text-[10px] text-emerald-400 font-mono">
            <span>ORACLE SENSORS</span>
            <span>{{ aiResponseModel() }}</span>
          </div>
          <div class="text-slate-200 leading-relaxed whitespace-pre-line text-xs">
            {{ aiReply() || 'Вітаю, студенте! Я твій інтелектуальний наставник. Постав запитання або запроси код-ревʼю твого рішення. Моє вікно можна вільно переміщувати та змінювати розмір!' }}
          </div>
        </div>
      </div>

      <!-- AI Prompt Input -->
      <div class="p-3 border-t border-white/10 bg-slate-950 flex items-center gap-2 shrink-0">
        <input
          type="text"
          [(ngModel)]="aiPromptText"
          (keydown.enter)="sendAiPrompt()"
          placeholder="Запитати наставника..."
          class="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
        />
        <button
          type="button"
          (click)="sendAiPrompt()"
          class="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
        >
          <mat-icon class="text-sm">send</mat-icon>
        </button>
      </div>
    </ng-template>
  `
})
export class IdeComponent implements OnInit {
  private state = inject(StateService);
  private execService = inject(ExecutionService);
  private aiService = inject(AiMentorService);

  readonly t = this.state.t;
  readonly island = this.state.activeIsland;
  readonly lesson = this.state.activeLesson;
  readonly tabSwitches = this.state.tabSwitchCounter;
  readonly pasteCount = this.state.pasteEventCounter;

  // Window Docking & Dragging State
  readonly consoleMode = signal<ConsoleDockMode>('right');
  readonly layoutPreset = signal<LayoutPreset>('default');

  // Splitter Dimensions (px)
  readonly leftWidth = signal<number>(360);
  readonly rightWidth = signal<number>(380);
  readonly bottomHeight = signal<number>(240);

  // Floating Windows Coordinates & State
  readonly consoleFloating = signal<FloatingWindowConfig>({
    x: 240,
    y: 90,
    width: 660,
    height: 440,
    minimized: false,
    maximized: false,
    zIndex: 35
  });

  readonly aiFloating = signal<FloatingWindowConfig & { isOpen: boolean; isFloating: boolean }>({
    isOpen: false,
    isFloating: false,
    x: 320,
    y: 70,
    width: 480,
    height: 520,
    minimized: false,
    maximized: false,
    zIndex: 40
  });

  private maxZIndex = 40;

  // Active dragging session
  activeDrag: {
    type: 'move' | 'resize' | 'splitter-left' | 'splitter-right' | 'splitter-bottom';
    target?: 'console' | 'ai';
    startX: number;
    startY: number;
    startPosX: number;
    startPosY: number;
    startWidth: number;
    startHeight: number;
  } | null = null;

  // Tabs state
  readonly leftTab = signal<'task' | 'theory' | 'oracle'>('task');
  readonly rightTab = signal<'tests' | 'terminal' | 'variables'>('tests');
  readonly showAiDrawer = signal<boolean>(false);

  // Multi-file explorer state
  readonly projectFiles = signal<ProjectFile[]>([]);
  readonly activeFileId = signal<string>('main');

  // Execution state
  readonly isExecuting = signal<boolean>(false);
  readonly executionResult = signal<ExecutionResult | null>(null);
  readonly revealedHintLevel = signal<number>(0);
  readonly quizAnswers = signal<Record<string, number>>({});

  // AI Mentor state
  aiPromptText = '';
  readonly aiReply = signal<string>('');
  readonly aiResponseModel = signal<string>('gemini-3.8-flash / oracle');

  readonly currentFile = computed<ProjectFile>(() => {
    const list = this.projectFiles();
    return list.find(f => f.id === this.activeFileId()) || list[0] || {
      id: 'main',
      name: 'main.js',
      path: 'src/main.js',
      content: this.lesson().starterCode,
      language: this.lesson().islandId === 'python' ? 'python' : 'javascript'
    };
  });

  readonly lineNumbers = computed(() => {
    const lines = (this.currentFile().content || '').split('\n');
    return Array.from({ length: Math.max(lines.length, 12) }, (_, i) => i + 1);
  });

  readonly sandboxOnline = signal<boolean>(true);
  readonly executionEngineLabel = computed(() => {
    const lang = this.island().language;
    if (lang === 'javascript' || lang === 'typescript') return 'Browser V8 Worker';
    if (lang === 'sql') return 'SQL WASM Engine';
    return 'Demo MicroVM Sandbox';
  });

  readonly consoleModeLabel = computed(() => {
    const m = this.consoleMode();
    if (m === 'floating') return 'Плаваюче вікно (вільне)';
    if (m === 'bottom') return 'Знизу';
    return 'Праворуч';
  });

  ngOnInit() {
    this.initProjectFiles();
  }

  // =========================================================
  // WINDOW MANAGEMENT & DRAGGING LOGIC
  // =========================================================

  setConsoleMode(mode: ConsoleDockMode) {
    this.consoleMode.set(mode);
    if (mode === 'floating') {
      this.consoleFloating.update(c => ({ ...c, minimized: false }));
      this.bringWindowToFront('console');
    }
  }

  applyLayoutPreset(preset: LayoutPreset) {
    this.layoutPreset.set(preset);
    if (preset === 'default') {
      this.consoleMode.set('right');
      this.leftWidth.set(360);
      this.rightWidth.set(380);
    } else if (preset === 'bottom-console') {
      this.consoleMode.set('bottom');
      this.bottomHeight.set(240);
      this.leftWidth.set(360);
    } else if (preset === 'free-windows') {
      this.consoleMode.set('floating');
      this.floatAiMentorWindow();
      this.bringWindowToFront('console');
    }
  }

  resetWindowPositions() {
    this.leftWidth.set(360);
    this.rightWidth.set(380);
    this.bottomHeight.set(240);
    this.consoleFloating.set({
      x: 240,
      y: 90,
      width: 660,
      height: 440,
      minimized: false,
      maximized: false,
      zIndex: 35
    });
    this.aiFloating.update(s => ({
      ...s,
      x: 320,
      y: 70,
      width: 480,
      height: 520,
      minimized: false,
      maximized: false
    }));
  }

  bringWindowToFront(target: 'console' | 'ai') {
    this.maxZIndex++;
    if (target === 'console') {
      this.consoleFloating.update(c => ({ ...c, zIndex: this.maxZIndex }));
    } else {
      this.aiFloating.update(c => ({ ...c, zIndex: this.maxZIndex }));
    }
  }

  minimizeWindow(target: 'console' | 'ai') {
    if (target === 'console') {
      this.consoleFloating.update(c => ({ ...c, minimized: true }));
    } else {
      this.aiFloating.update(c => ({ ...c, minimized: true }));
    }
  }

  restoreWindow(target: 'console' | 'ai') {
    if (target === 'console') {
      this.consoleFloating.update(c => ({ ...c, minimized: false }));
      this.bringWindowToFront('console');
    } else {
      this.aiFloating.update(c => ({ ...c, minimized: false, isOpen: true }));
      this.bringWindowToFront('ai');
    }
  }

  toggleMaximizeWindow(target: 'console' | 'ai') {
    if (target === 'console') {
      this.consoleFloating.update(c => ({ ...c, maximized: !c.maximized }));
    } else {
      this.aiFloating.update(c => ({ ...c, maximized: !c.maximized }));
    }
  }

  // AI Mentor window controls
  toggleAiMentor() {
    if (this.aiFloating().isFloating) {
      if (this.aiFloating().isOpen) {
        if (this.aiFloating().minimized) {
          this.restoreWindow('ai');
        } else {
          this.closeAiMentor();
        }
      } else {
        this.aiFloating.update(s => ({ ...s, isOpen: true, minimized: false }));
        this.bringWindowToFront('ai');
      }
    } else {
      this.showAiDrawer.update(v => !v);
    }
  }

  floatAiMentorWindow() {
    this.showAiDrawer.set(false);
    this.aiFloating.update(s => ({
      ...s,
      isOpen: true,
      isFloating: true,
      minimized: false
    }));
    this.bringWindowToFront('ai');
  }

  dockAiMentorAsDrawer() {
    this.aiFloating.update(s => ({ ...s, isFloating: false, isOpen: false }));
    this.showAiDrawer.set(true);
  }

  closeAiMentor() {
    this.showAiDrawer.set(false);
    this.aiFloating.update(s => ({ ...s, isOpen: false }));
  }

  // Start dragging a floating window by header
  startWindowDrag(target: 'console' | 'ai', e: MouseEvent) {
    e.preventDefault();
    this.bringWindowToFront(target);
    const win = target === 'console' ? this.consoleFloating() : this.aiFloating();
    if (win.maximized) return;

    this.activeDrag = {
      type: 'move',
      target,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: win.x,
      startPosY: win.y,
      startWidth: win.width,
      startHeight: win.height
    };
  }

  startWindowDragTouch(target: 'console' | 'ai', e: TouchEvent) {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    this.bringWindowToFront(target);
    const win = target === 'console' ? this.consoleFloating() : this.aiFloating();
    if (win.maximized) return;

    this.activeDrag = {
      type: 'move',
      target,
      startX: t.clientX,
      startY: t.clientY,
      startPosX: win.x,
      startPosY: win.y,
      startWidth: win.width,
      startHeight: win.height
    };
  }

  // Start resizing a floating window from bottom-right grip
  startWindowResize(target: 'console' | 'ai', e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.bringWindowToFront(target);
    const win = target === 'console' ? this.consoleFloating() : this.aiFloating();

    this.activeDrag = {
      type: 'resize',
      target,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: win.x,
      startPosY: win.y,
      startWidth: win.width,
      startHeight: win.height
    };
  }

  startWindowResizeTouch(target: 'console' | 'ai', e: TouchEvent) {
    if (e.touches.length !== 1) return;
    e.stopPropagation();
    const t = e.touches[0];
    this.bringWindowToFront(target);
    const win = target === 'console' ? this.consoleFloating() : this.aiFloating();

    this.activeDrag = {
      type: 'resize',
      target,
      startX: t.clientX,
      startY: t.clientY,
      startPosX: win.x,
      startPosY: win.y,
      startWidth: win.width,
      startHeight: win.height
    };
  }

  // Splitter dragging
  startSplitterDrag(type: 'splitter-left' | 'splitter-right' | 'splitter-bottom', e: MouseEvent) {
    e.preventDefault();
    let startDim = 0;
    if (type === 'splitter-left') startDim = this.leftWidth();
    else if (type === 'splitter-right') startDim = this.rightWidth();
    else if (type === 'splitter-bottom') startDim = this.bottomHeight();

    this.activeDrag = {
      type,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: 0,
      startPosY: 0,
      startWidth: startDim,
      startHeight: startDim
    };
  }

  startSplitterDragTouch(type: 'splitter-left' | 'splitter-right' | 'splitter-bottom', e: TouchEvent) {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    let startDim = 0;
    if (type === 'splitter-left') startDim = this.leftWidth();
    else if (type === 'splitter-right') startDim = this.rightWidth();
    else if (type === 'splitter-bottom') startDim = this.bottomHeight();

    this.activeDrag = {
      type,
      startX: t.clientX,
      startY: t.clientY,
      startPosX: 0,
      startPosY: 0,
      startWidth: startDim,
      startHeight: startDim
    };
  }

  // Global mousemove & mouseup listeners
  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (!this.activeDrag) return;
    this.handleDragMove(e.clientX, e.clientY);
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(e: TouchEvent) {
    if (!this.activeDrag || e.touches.length !== 1) return;
    const t = e.touches[0];
    this.handleDragMove(t.clientX, t.clientY);
  }

  private handleDragMove(clientX: number, clientY: number) {
    if (!this.activeDrag) return;
    const dx = clientX - this.activeDrag.startX;
    const dy = clientY - this.activeDrag.startY;

    if (this.activeDrag.type === 'move') {
      const maxW = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const maxH = typeof window !== 'undefined' ? window.innerHeight : 800;

      if (this.activeDrag.target === 'console') {
        const newX = Math.max(10, Math.min(maxW - 150, this.activeDrag.startPosX + dx));
        const newY = Math.max(45, Math.min(maxH - 80, this.activeDrag.startPosY + dy));
        this.consoleFloating.update(s => ({ ...s, x: newX, y: newY }));
      } else if (this.activeDrag.target === 'ai') {
        const newX = Math.max(10, Math.min(maxW - 150, this.activeDrag.startPosX + dx));
        const newY = Math.max(45, Math.min(maxH - 80, this.activeDrag.startPosY + dy));
        this.aiFloating.update(s => ({ ...s, x: newX, y: newY }));
      }
    } else if (this.activeDrag.type === 'resize') {
      const maxW = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const maxH = typeof window !== 'undefined' ? window.innerHeight : 800;

      if (this.activeDrag.target === 'console') {
        const newW = Math.max(340, Math.min(maxW - 20, this.activeDrag.startWidth + dx));
        const newH = Math.max(220, Math.min(maxH - 60, this.activeDrag.startHeight + dy));
        this.consoleFloating.update(s => ({ ...s, width: newW, height: newH }));
      } else if (this.activeDrag.target === 'ai') {
        const newW = Math.max(320, Math.min(maxW - 20, this.activeDrag.startWidth + dx));
        const newH = Math.max(260, Math.min(maxH - 60, this.activeDrag.startHeight + dy));
        this.aiFloating.update(s => ({ ...s, width: newW, height: newH }));
      }
    } else if (this.activeDrag.type === 'splitter-left') {
      const newW = Math.max(220, Math.min(650, this.activeDrag.startWidth + dx));
      this.leftWidth.set(newW);
    } else if (this.activeDrag.type === 'splitter-right') {
      const newW = Math.max(260, Math.min(750, this.activeDrag.startWidth - dx));
      this.rightWidth.set(newW);
    } else if (this.activeDrag.type === 'splitter-bottom') {
      const newH = Math.max(140, Math.min(600, this.activeDrag.startHeight - dy));
      this.bottomHeight.set(newH);
    }
  }

  @HostListener('window:mouseup')
  @HostListener('window:touchend')
  onDragEnd() {
    this.activeDrag = null;
  }

  // =========================================================
  // CORE IDE FUNCTIONALITY
  // =========================================================

  private initProjectFiles() {
    const curLesson = this.lesson();
    const lang = curLesson.islandId === 'python' ? 'python' : 'javascript';
    const ext = lang === 'python' ? '.py' : '.js';

    this.projectFiles.set([
      {
        id: 'main',
        name: `main${ext}`,
        path: `src/main${ext}`,
        content: curLesson.starterCode,
        language: lang,
        isEntry: true
      },
      {
        id: 'utils',
        name: `utils${ext}`,
        path: `src/utils${ext}`,
        content: `// Допоміжні функції та валідація\nexport function validateInput(val) {\n  return val !== null && val !== undefined;\n}\n`,
        language: lang
      },
      {
        id: 'test',
        name: `main.test${ext}`,
        path: `tests/main.test${ext}`,
        content: `// Автоматичні тести завдання\n// Запускаються на вкладці "Тести"\n`,
        language: lang
      },
      {
        id: 'readme',
        name: 'README.md',
        path: 'README.md',
        content: `# ${curLesson.title}\n\n${curLesson.objective}\n\nСтворено в середовищі "АРХИПЕЛАГ КОДА".`,
        language: 'markdown'
      }
    ]);
  }

  @HostListener('window:blur')
  onWindowBlur() {
    this.state.recordTabSwitch();
  }

  onPaste() {
    this.state.recordPasteEvent();
  }

  onCodeChange(val: string) {
    const activeId = this.activeFileId();
    this.projectFiles.update(files =>
      files.map(f => (f.id === activeId ? { ...f, content: val } : f))
    );
  }

  selectQuizAnswer(questionId: string, optIndex: number) {
    this.quizAnswers.update(curr => ({ ...curr, [questionId]: optIndex }));
  }

  quizAnswerState(q: QuizQuestion, optIndex: number): string {
    const selected = this.quizAnswers()[q.id];
    if (selected === undefined) {
      return 'border-white/10 hover:border-white/30 text-slate-300';
    }
    if (optIndex === q.correctIndex) {
      return 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold';
    }
    if (selected === optIndex) {
      return 'border-rose-500 bg-rose-500/20 text-rose-300 font-bold';
    }
    return 'border-white/5 opacity-50 text-slate-500';
  }

  revealHint(level: number) {
    this.revealedHintLevel.set(Math.max(this.revealedHintLevel(), level));
    this.state.recordHintUsed(level);
  }

  applySolution() {
    const sol = this.lesson().oracleSolution;
    this.onCodeChange(sol);
  }

  resetToTemplate() {
    this.onCodeChange(this.lesson().starterCode);
  }

  clearOutput() {
    this.executionResult.set(null);
  }

  async executeCode() {
    this.isExecuting.set(true);
    this.rightTab.set('tests');

    try {
      const code = this.currentFile().content;
      const lang = this.currentFile().language;
      const res = await this.execService.runCode(code, lang, this.lesson().testCases);
      this.executionResult.set(res);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.executionResult.set({
        status: 'runtime_error',
        stdout: '',
        stderr: errorMsg,
        executionTimeMs: 0
      });
    } finally {
      this.isExecuting.set(false);
    }
  }

  async submitSolution() {
    await this.executeCode();
    const res = this.executionResult();

    if (res && res.status === 'success') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      this.state.completeActiveLesson(100);
    }
  }

  exitToIsland() {
    this.state.setView('island-detail');
  }

  async askAi(prompt: string) {
    if (!this.aiFloating().isFloating) {
      this.showAiDrawer.set(true);
    } else {
      this.aiFloating.update(s => ({ ...s, isOpen: true, minimized: false }));
      this.bringWindowToFront('ai');
    }

    this.aiReply.set('Аналіз запиту через Oracle AI...');
    const curLesson = this.lesson();

    const response = await this.aiService.askMentor({
      prompt,
      code: this.currentFile().content,
      language: this.currentFile().language,
      lessonTitle: curLesson.title,
      level: `Level ${curLesson.level}`,
      hintLevel: 'concept',
      locale: this.state.currentLanguage()
    });

    this.aiReply.set(response.reply);
    this.aiResponseModel.set(response.model);
  }

  async requestCodeReview() {
    if (!this.aiFloating().isFloating) {
      this.showAiDrawer.set(true);
    } else {
      this.aiFloating.update(s => ({ ...s, isOpen: true, minimized: false }));
      this.bringWindowToFront('ai');
    }

    this.aiReply.set('Виконується комплексне код-ревʼю (Clean Code, Big-O, Security)...');
    const curLesson = this.lesson();

    const review = await this.aiService.requestCodeReview(
      this.currentFile().content,
      this.currentFile().language,
      curLesson.title,
      this.state.currentLanguage()
    );

    this.aiReply.set(review);
  }

  sendAiPrompt() {
    if (!this.aiPromptText.trim()) return;
    const txt = this.aiPromptText;
    this.aiPromptText = '';
    this.askAi(txt);
  }
}
