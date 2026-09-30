import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StateService } from '../../core/services/state.service';
import { EducationalProfile } from '../../core/models/archipelago.model';

@Component({
  selector: 'app-onboarding',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="min-h-[calc(100vh-60px)] flex items-center justify-center p-4 bg-slate-950 bg-grid-pattern relative overflow-hidden">
      <!-- Glow ambient background blobs -->
      <div class="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div class="w-full max-w-xl glass-panel-elevated rounded-2xl p-6 sm:p-8 relative z-10 border border-white/10 shadow-2xl transition-all">
        <!-- Progress Steps -->
        <div class="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <div class="flex items-center gap-1.5">
            @for (s of [1, 2, 3, 4, 5]; track s) {
              <div
                class="w-7 h-1.5 rounded-full transition-all duration-300"
                [class]="step() >= s ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' : 'bg-slate-800'"
              ></div>
            }
          </div>
          <span class="text-xs font-mono text-slate-400">Крок {{ step() }} / 5</span>
        </div>

        <!-- SCREEN 1: Welcome -->
        @if (step() === 1) {
          <div class="text-center py-6 space-y-6">
            <div class="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-1 shadow-xl shadow-emerald-500/20 animate-pulse">
              <div class="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
                <mat-icon class="text-4xl text-emerald-400">public</mat-icon>
              </div>
            </div>

            <div class="space-y-2">
              <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
                АРХИПЕЛАГ КОДА
              </h1>
              <p class="text-base sm:text-lg text-emerald-400/90 font-medium">
                Построй свой путь в мире программирования.
              </p>
              <p class="text-xs text-slate-400 max-w-md mx-auto pt-2">
                Інтерактивне освітнє середовище нового покоління. 16 технологічних островів, реальні IDE та симулятори, штучний інтелект Oracle, Linux, Git, SQL та повні інженерні проекти.
              </p>
            </div>

            <button
              (click)="nextStep()"
              class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/25 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <span>НАЧАТЬ ПУТЕШЕСТВИЕ</span>
              <mat-icon class="text-lg">arrow_forward</mat-icon>
            </button>
          </div>
        }

        <!-- SCREEN 2: Language Selection -->
        @if (step() === 2) {
          <div class="space-y-6 py-2">
            <div class="text-center space-y-1">
              <h2 class="text-2xl font-bold text-white">Оберіть мову інтерфейсу</h2>
              <p class="text-xs text-slate-400">Select your preferred system language</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                (click)="selectedLanguage.set('uk')"
                [class]="selectedLanguage() === 'uk' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-slate-900/60 hover:bg-slate-800/60'"
                class="cursor-pointer p-5 rounded-xl border text-center transition-all flex flex-col items-center gap-2"
              >
                <span class="text-3xl">🇺🇦</span>
                <span class="font-bold text-slate-100">Українська</span>
                <span class="text-xs text-slate-400">Основна мова платформи</span>
              </button>

              <button
                type="button"
                (click)="selectedLanguage.set('en')"
                [class]="selectedLanguage() === 'en' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-slate-900/60 hover:bg-slate-800/60'"
                class="cursor-pointer p-5 rounded-xl border text-center transition-all flex flex-col items-center gap-2"
              >
                <span class="text-3xl">🇬🇧</span>
                <span class="font-bold text-slate-100">English</span>
                <span class="text-xs text-slate-400">Global engineering standard</span>
              </button>
            </div>

            <div class="flex items-center justify-between pt-4">
              <button (click)="prevStep()" class="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white flex items-center gap-1">
                <mat-icon class="text-sm">arrow_back</mat-icon> Назад
              </button>
              <button
                (click)="confirmLanguage()"
                class="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors flex items-center gap-1.5"
              >
                Далі <mat-icon class="text-sm">arrow_forward</mat-icon>
              </button>
            </div>
          </div>
        }

        <!-- SCREEN 3: Profile Selection -->
        @if (step() === 3) {
          <div class="space-y-6 py-2">
            <div class="text-center space-y-1">
              <h2 class="text-2xl font-bold text-white">Хто ви?</h2>
              <p class="text-xs text-slate-400">Оберіть ваш поточний освітній статус</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- School -->
              <button
                type="button"
                (click)="selectedProfile.set('school')"
                [class]="selectedProfile() === 'school' ? 'border-emerald-500 bg-emerald-500/15' : 'border-white/5 bg-slate-900/60 hover:bg-slate-800'"
                class="cursor-pointer p-4 rounded-xl border transition-all text-left space-y-1"
              >
                <div class="flex items-center gap-2 font-bold text-sm text-slate-100">
                  <mat-icon class="text-emerald-400 text-lg">backpack</mat-icon>
                  <span>Школа (1–12 класи)</span>
                </div>
                <p class="text-xs text-slate-400 leading-relaxed">
                  Візуальна логіка, ігрові завдання, алгоритми, 12-бальне оцінювання.
                </p>
              </button>

              <!-- Vocational / PTU -->
              <button
                type="button"
                (click)="selectedProfile.set('vocational')"
                [class]="selectedProfile() === 'vocational' ? 'border-emerald-500 bg-emerald-500/15' : 'border-white/5 bg-slate-900/60 hover:bg-slate-800'"
                class="cursor-pointer p-4 rounded-xl border transition-all text-left space-y-1"
              >
                <div class="flex items-center gap-2 font-bold text-sm text-slate-100">
                  <mat-icon class="text-amber-400 text-lg">build</mat-icon>
                  <span>ПТУ</span>
                </div>
                <p class="text-xs text-slate-400 leading-relaxed">
                  Прикладне програмування, Web, Bash, адміністрування, практичні навички.
                </p>
              </button>

              <!-- College -->
              <button
                type="button"
                (click)="selectedProfile.set('college')"
                [class]="selectedProfile() === 'college' ? 'border-emerald-500 bg-emerald-500/15' : 'border-white/5 bg-slate-900/60 hover:bg-slate-800'"
                class="cursor-pointer p-4 rounded-xl border transition-all text-left space-y-1"
              >
                <div class="flex items-center gap-2 font-bold text-sm text-slate-100">
                  <mat-icon class="text-cyan-400 text-lg">domain</mat-icon>
                  <span>Коледж / ФПЗ</span>
                </div>
                <p class="text-xs text-slate-400 leading-relaxed">
                  Модульна розробка, ООП, бази даних, API, тестування, архітектура додатків.
                </p>
              </button>

              <!-- University -->
              <button
                type="button"
                (click)="selectedProfile.set('university')"
                [class]="selectedProfile() === 'university' ? 'border-emerald-500 bg-emerald-500/15' : 'border-white/5 bg-slate-900/60 hover:bg-slate-800'"
                class="cursor-pointer p-4 rounded-xl border transition-all text-left space-y-1"
              >
                <div class="flex items-center gap-2 font-bold text-sm text-slate-100">
                  <mat-icon class="text-indigo-400 text-lg">account_balance</mat-icon>
                  <span>Університет / ЗВО</span>
                </div>
                <p class="text-xs text-slate-400 leading-relaxed">
                  Академічна теорія, структури даних, складність O(N), ECTS, розподілені системи.
                </p>
              </button>
            </div>

            <div class="flex items-center justify-between pt-4">
              <button (click)="prevStep()" class="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white flex items-center gap-1">
                <mat-icon class="text-sm">arrow_back</mat-icon> Назад
              </button>
              <button
                (click)="nextStep()"
                class="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors flex items-center gap-1.5"
              >
                Далі <mat-icon class="text-sm">arrow_forward</mat-icon>
              </button>
            </div>
          </div>
        }

        <!-- SCREEN 4: Class / Course Level -->
        @if (step() === 4) {
          <div class="space-y-6 py-2">
            <div class="text-center space-y-1">
              <h2 class="text-2xl font-bold text-white">Вибір класу / курсу / рівня</h2>
              <p class="text-xs text-slate-400">Це допоможе оптимізувати складність завдань та адаптивний темп</p>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              @for (lvl of gradeOptions(); track lvl) {
                <button
                  (click)="selectedGrade.set(lvl)"
                  [class]="selectedGrade() === lvl ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold' : 'border-white/5 bg-slate-900/60 text-slate-300 hover:bg-slate-800'"
                  class="py-3 px-2 rounded-xl border text-xs text-center transition-all"
                >
                  {{ lvl }}
                </button>
              }
            </div>

            <div class="flex items-center justify-between pt-4">
              <button (click)="prevStep()" class="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white flex items-center gap-1">
                <mat-icon class="text-sm">arrow_back</mat-icon> Назад
              </button>
              <button
                (click)="nextStep()"
                class="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors flex items-center gap-1.5"
              >
                Далі <mat-icon class="text-sm">arrow_forward</mat-icon>
              </button>
            </div>
          </div>
        }

        <!-- SCREEN 5: Interests -->
        @if (step() === 5) {
          <div class="space-y-6 py-2">
            <div class="text-center space-y-1">
              <h2 class="text-2xl font-bold text-white">Інтереси та напрямки</h2>
              <p class="text-xs text-slate-400">Оберіть галузі, які вам найбільш цікаві (можна декілька):</p>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              @for (item of interestOptions; track item.id) {
                <button
                  type="button"
                  (click)="toggleInterest(item.id)"
                  [class]="isInterestSelected(item.id) ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-medium' : 'border-white/5 bg-slate-900/60 text-slate-300 hover:bg-slate-800'"
                  class="cursor-pointer p-3 rounded-xl border text-xs flex items-center gap-2 transition-all text-left"
                >
                  <mat-icon class="text-sm" [class.text-emerald-400]="isInterestSelected(item.id)">
                    {{ isInterestSelected(item.id) ? 'check_box' : 'check_box_outline_blank' }}
                  </mat-icon>
                  <span>{{ item.label }}</span>
                </button>
              }
            </div>

            <div class="flex items-center justify-between pt-4">
              <button (click)="prevStep()" class="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white flex items-center gap-1">
                <mat-icon class="text-sm">arrow_back</mat-icon> Назад
              </button>
              <button
                (click)="finish()"
                class="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-extrabold text-xs tracking-wider shadow-lg shadow-emerald-500/30 hover:opacity-95 transition-all flex items-center gap-1.5"
              >
                <span>ВВІЙТИ В АРХІПЕЛАГ</span>
                <mat-icon class="text-sm">rocket_launch</mat-icon>
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class OnboardingComponent {
  private state = inject(StateService);

  readonly step = signal<number>(1);
  readonly selectedLanguage = signal<'uk' | 'en'>('uk');
  readonly selectedProfile = signal<EducationalProfile>('college');
  readonly selectedGrade = signal<string>('2 курс');
  readonly selectedInterests = signal<string[]>(['Programming', 'Algorithms', 'Web']);

  readonly interestOptions = [
    { id: 'Programming', label: 'Програмування' },
    { id: 'Web', label: 'Web Розробка' },
    { id: 'Data', label: 'Data Science' },
    { id: 'Algorithms', label: 'Алгоритми' },
    { id: 'Databases', label: 'Бази даних' },
    { id: 'Linux', label: 'Linux / Bash' },
    { id: 'Cybersecurity', label: 'Кібербезпека' },
    { id: 'AI', label: 'Штучний Інтелект' },
    { id: 'Game Development', label: 'Game Development' },
  ];

  gradeOptions() {
    switch (this.selectedProfile()) {
      case 'school':
        return ['1-4 класи', '5-7 класи', '8-9 класи', '10-12 класи'];
      case 'vocational':
        return ['1 курс', '2 курс', '3 курс', 'Випускник'];
      case 'college':
        return ['1 курс', '2 курс', '3 курс', '4 курс'];
      case 'university':
        return ['Бакалавр 1-2', 'Бакалавр 3-4', 'Магістр', 'Аспірантура'];
    }
  }

  nextStep() {
    this.step.update(s => s + 1);
  }

  prevStep() {
    this.step.update(s => Math.max(1, s - 1));
  }

  confirmLanguage() {
    this.state.setLanguage(this.selectedLanguage());
    this.nextStep();
  }

  toggleInterest(id: string) {
    this.selectedInterests.update(curr =>
      curr.includes(id) ? curr.filter(x => x !== id) : [...curr, id]
    );
  }

  isInterestSelected(id: string): boolean {
    return this.selectedInterests().includes(id);
  }

  finish() {
    this.state.completeOnboarding({
      profile: this.selectedProfile(),
      grade: this.selectedGrade(),
      interests: this.selectedInterests(),
      language: this.selectedLanguage()
    });
  }
}
