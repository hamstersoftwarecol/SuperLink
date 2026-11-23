import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">{{ title() }}</span>
        <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
          <ng-content select="[icon]"></ng-content>
        </div>
      </div>
      <div class="mt-4 flex items-baseline justify-between">
        <div class="text-2xl font-bold tracking-tight text-slate-900">{{ value() }}</div>
        @if (change() !== undefined && change() !== null) {
          <div
            class="flex items-center text-xs font-semibold px-2 py-0.5 rounded-full"
            [class.bg-emerald-50]="change()! >= 0"
            [class.text-emerald-700]="change()! >= 0"
            [class.bg-rose-50]="change()! < 0"
            [class.text-rose-700]="change()! < 0"
          >
            @if (change()! >= 0) {
              <svg class="w-3.5 h-3.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
              </svg>
            } @else {
              <svg class="w-3.5 h-3.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
              </svg>
            }
            {{ change()! >= 0 ? '+' : '' }}{{ change() }}%
          </div>
        }
      </div>
      @if (subtitle()) {
        <p class="mt-1 text-xs text-slate-400">{{ subtitle() }}</p>
      }
    </div>
  `
})
export class StatCardComponent {
  title = input.required<string>();
  value = input.required<string | number>();
  change = input<number | null>(null);
  subtitle = input<string>('vs período anterior');
}
