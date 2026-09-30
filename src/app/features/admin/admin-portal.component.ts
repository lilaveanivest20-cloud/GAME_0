import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StateService } from '../../core/services/state.service';

@Component({
  selector: 'app-admin-portal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div class="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-black text-white">
              {{ t().nav.admin }}
            </h1>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
              SYSTEM CONTROL & SANDBOXES
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Керування ізольованими воркерами пісочниць, політиками безпеки MicroVM, організаціями та системним аудитом.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/5 text-xs font-mono text-emerald-400">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Cluster: HEALTHY</span>
          </div>
        </div>
      </div>

      <!-- Sandbox Security Policy & Workers Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Security Policies Matrix -->
        <div class="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
          <div class="font-bold text-sm text-white flex items-center gap-2">
            <mat-icon class="text-rose-400 text-base">security</mat-icon>
            <span>Sandbox Isolation Policy (SecComp & cgroups)</span>
          </div>

          <div class="space-y-2 text-xs font-mono">
            <div class="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-white/5">
              <span class="text-slate-400">Network Access:</span>
              <span class="text-rose-400 font-bold">none (Blocked)</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-white/5">
              <span class="text-slate-400">Root Filesystem:</span>
              <span class="text-emerald-400 font-bold">read-only (ro)</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-white/5">
              <span class="text-slate-400">New Privileges:</span>
              <span class="text-emerald-400 font-bold">no-new-privileges</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-white/5">
              <span class="text-slate-400">Linux Capabilities:</span>
              <span class="text-emerald-400 font-bold">ALL DROPPED</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-white/5">
              <span class="text-slate-400">CPU Limit per task:</span>
              <span class="text-cyan-400 font-bold">1.0 vCPU</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-white/5">
              <span class="text-slate-400">RAM Limit:</span>
              <span class="text-cyan-400 font-bold">128 MB</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-white/5">
              <span class="text-slate-400">Max PIDs limit:</span>
              <span class="text-cyan-400 font-bold">32 processes</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-white/5">
              <span class="text-slate-400">Execution Timeout:</span>
              <span class="text-amber-400 font-bold">3,000 ms</span>
            </div>
          </div>
        </div>

        <!-- Active Worker Pools -->
        <div class="lg:col-span-2 glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
          <div class="flex items-center justify-between">
            <div class="font-bold text-sm text-white flex items-center gap-2">
              <mat-icon class="text-cyan-400 text-base">dns</mat-icon>
              <span>Sandbox Worker Nodes (MicroVM Runners)</span>
            </div>
            <span class="text-xs text-slate-400 font-mono">4 Workers Online</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            @for (worker of workers; track worker.id) {
              <div class="bg-slate-950 p-4 rounded-2xl border border-white/5 space-y-2 text-xs font-mono">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-white">{{ worker.id }}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    {{ worker.status }}
                  </span>
                </div>
                <div class="text-[11px] text-slate-400">Target: {{ worker.languages.join(', ') }}</div>
                <div class="space-y-1 pt-1">
                  <div class="flex justify-between text-[10px] text-slate-400">
                    <span>CPU: {{ worker.cpu }}%</span>
                    <span>RAM: {{ worker.mem }}MB / 512MB</span>
                  </div>
                  <div class="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-emerald-400 h-full rounded-full" [style.width.%]="worker.cpu * 2"></div>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Security Audit Log -->
          <div class="pt-3 border-t border-white/5 space-y-2">
            <span class="font-bold text-xs text-slate-300">Security & Integrity Audit Log:</span>
            <div class="bg-slate-950 p-3 rounded-xl border border-white/5 text-[11px] font-mono text-slate-400 space-y-1">
              <div>[10:04:12] Sandbox job #9412 exited with status 0 (Python 3.12, 18ms, 14.2MB)</div>
              <div>[10:05:30] Network socket open attempt blocked by policy on Worker-02 (drop)</div>
              <div>[10:07:01] C++ GCC 14.1 compiled successfully within memory limit (22ms)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminPortalComponent {
  private state = inject(StateService);
  readonly t = this.state.t;

  readonly workers = [
    { id: 'worker-node-01', languages: ['C++', 'Rust', 'Go'], status: 'READY', cpu: 14, mem: 64 },
    { id: 'worker-node-02', languages: ['Java', 'C#', '.NET'], status: 'READY', cpu: 22, mem: 128 },
    { id: 'worker-node-03', languages: ['Python WASM', 'Bash'], status: 'READY', cpu: 8, mem: 48 },
    { id: 'worker-node-04', languages: ['SQL Engine'], status: 'IDLE', cpu: 2, mem: 32 },
  ];
}
