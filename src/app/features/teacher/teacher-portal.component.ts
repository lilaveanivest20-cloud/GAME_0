import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
import { StudentSubmission } from '../../core/models/lms.model';

@Component({
  selector: 'app-teacher-portal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <!-- Header Banner -->
      <div class="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-black text-white">
              {{ t().nav.teacher }}
            </h1>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              LMS & INTEGRITY SIGNALS
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Керування навчальними групами, призначення завдань, моніторинг академічної доброчесності та експорт відомостей оцінок.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Export Grades -->
          <button
            (click)="exportGradesCsv()"
            class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
          >
            <mat-icon class="text-sm">download</mat-icon>
            <span>Експорт відомості (CSV)</span>
          </button>

          <!-- Create Group Modal trigger -->
          <button
            (click)="showCreateGroupModal.set(true)"
            class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-500/20"
          >
            <mat-icon class="text-sm">group_add</mat-icon>
            <span>+ Створити групу</span>
          </button>
        </div>
      </div>

      <!-- Quick Metrics Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
          <div class="text-[11px] text-slate-400 uppercase font-mono">Активних студентів</div>
          <div class="text-2xl font-black text-white">128</div>
          <div class="text-[10px] text-emerald-400">94% відвідуваність</div>
        </div>
        <div class="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
          <div class="text-[11px] text-slate-400 uppercase font-mono">Зданих робіт</div>
          <div class="text-2xl font-black text-indigo-400">412</div>
          <div class="text-[10px] text-slate-400">за поточний семестр</div>
        </div>
        <div class="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
          <div class="text-[11px] text-slate-400 uppercase font-mono">Середній бал</div>
          <div class="text-2xl font-black text-amber-400">88.4 / 100</div>
          <div class="text-[10px] text-emerald-400">ECTS: B (Добре)</div>
        </div>
        <div class="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
          <div class="text-[11px] text-slate-400 uppercase font-mono">Сигнали аномалій</div>
          <div class="text-2xl font-black text-rose-400">3</div>
          <div class="text-[10px] text-rose-400 font-semibold">Потребують ревʼю</div>
        </div>
      </div>

      <!-- Student Submissions with Integrity Signals -->
      <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <div class="flex items-center justify-between">
          <div class="font-bold text-sm text-white flex items-center gap-2">
            <mat-icon class="text-indigo-400">fact_check</mat-icon>
            <span>Останні студентські роботи & Контроль доброчесності (Integrity)</span>
          </div>
          <span class="text-xs text-slate-400 font-mono">Група: КБ-21 (Коледж)</span>
        </div>

        <div class="bg-slate-950 rounded-2xl border border-white/5 overflow-x-auto">
          <table class="w-full text-left text-xs font-mono">
            <thead class="bg-slate-900/90 text-slate-400 border-b border-white/10">
              <tr>
                <th class="p-3">Студент</th>
                <th class="p-3">Завдання</th>
                <th class="p-3">Оцінка (12 / 100)</th>
                <th class="p-3">Підказки Oracle</th>
                <th class="p-3">Вставки (Paste)</th>
                <th class="p-3">Вкладки (Switches)</th>
                <th class="p-3">Статус доброчесності</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5 text-slate-300">
              @for (sub of submissions(); track sub.id) {
                <tr class="hover:bg-slate-900/40 transition-colors">
                  <td class="p-3 font-medium text-white flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">
                      {{ sub.studentName.slice(0, 1) }}
                    </span>
                    <span>{{ sub.studentName }}</span>
                  </td>
                  <td class="p-3 text-cyan-300">{{ sub.lessonTitle }}</td>
                  <td class="p-3">
                    <span class="font-bold text-emerald-400">{{ sub.score12 }} б.</span>
                    <span class="text-slate-500 text-[10px]"> ({{ sub.score100 }}/100, {{ sub.ectsGrade }})</span>
                  </td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded text-[10px]" [class]="sub.hintsUsed > 2 ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'">
                      Рівень {{ sub.hintsUsed }}
                    </span>
                  </td>
                  <td class="p-3 text-slate-300">{{ sub.pasteEventsCount }}</td>
                  <td class="p-3 text-slate-300">{{ sub.tabSwitchCount }}</td>
                  <td class="p-3">
                    @if (sub.status === 'flagged') {
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-max">
                        <mat-icon class="text-xs">warning</mat-icon> ФЛАГ АНОМАЛІЇ
                      </span>
                    } @else {
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-max">
                        <mat-icon class="text-xs">verified</mat-icon> ПІДТВЕРДЖЕНО
                      </span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class TeacherPortalComponent {
  private state = inject(StateService);
  readonly t = this.state.t;
  readonly showCreateGroupModal = signal<boolean>(false);

  readonly submissions = signal<StudentSubmission[]>([
    {
      id: 'sub_01',
      studentId: 's1',
      studentName: 'Олександр Шевченко',
      lessonId: 'lvl1-variables-basics',
      lessonTitle: '1.1 Змінні та Типи даних',
      groupId: 'grp_01',
      submittedAt: '2026-09-28 09:30',
      status: 'graded',
      score12: 12,
      score100: 98,
      ectsGrade: 'A',
      hintsUsed: 1,
      pasteEventsCount: 0,
      tabSwitchCount: 1,
      integrityFlags: [],
      codeSnapshot: '...'
    },
    {
      id: 'sub_02',
      studentId: 's2',
      studentName: 'Марія Коваленко',
      lessonId: 'lvl5-algorithms-big-o',
      lessonTitle: '5.1 Бінарний пошук O(log N)',
      groupId: 'grp_01',
      submittedAt: '2026-09-28 09:42',
      status: 'graded',
      score12: 11,
      score100: 92,
      ectsGrade: 'A',
      hintsUsed: 0,
      pasteEventsCount: 1,
      tabSwitchCount: 0,
      integrityFlags: [],
      codeSnapshot: '...'
    },
    {
      id: 'sub_03',
      studentId: 's3',
      studentName: 'Богдан Васильєв',
      lessonId: 'lvl2-arrays-objects',
      lessonTitle: '2.1 Масиви та Обʼєкти',
      groupId: 'grp_01',
      submittedAt: '2026-09-28 09:55',
      status: 'flagged',
      score12: 8,
      score100: 74,
      ectsGrade: 'C',
      hintsUsed: 3,
      pasteEventsCount: 8,
      tabSwitchCount: 14,
      integrityFlags: ['Висока частота перемикання вкладок', 'Швидка вставка великого фрагмента коду'],
      codeSnapshot: '...'
    }
  ]);

  exportGradesCsv() {
    const subs = this.submissions();
    const rows = [
      ['Student', 'Lesson', 'Score_12', 'Score_100', 'ECTS', 'Hints_Used', 'Paste_Count', 'Tab_Switches', 'Status'],
      ...subs.map(s => [
        s.studentName,
        s.lessonTitle,
        s.score12 || '',
        s.score100 || '',
        s.ectsGrade || '',
        s.hintsUsed,
        s.pasteEventsCount,
        s.tabSwitchCount,
        s.status
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'archipelago_grades_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
