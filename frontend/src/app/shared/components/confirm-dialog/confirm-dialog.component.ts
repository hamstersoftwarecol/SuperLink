import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-100 transform transition-all duration-200">
          <div class="flex items-start gap-4">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              [class.bg-rose-100]="isDestructive()"
              [class.text-rose-600]="isDestructive()"
              [class.bg-amber-100]="!isDestructive()"
              [class.text-amber-600]="!isDestructive()"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-slate-900">{{ title() }}</h3>
              <p class="mt-2 text-sm text-slate-500">{{ message() }}</p>
            </div>
          </div>
          <div class="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="cancelled.emit()"
              class="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              {{ cancelText() }}
            </button>
            <button
              type="button"
              (click)="confirmed.emit()"
              [class]="isDestructive() ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'"
              class="px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
            >
              {{ confirmText() }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  isOpen = input<boolean>(false);
  title = input<string>('¿Estás seguro?');
  message = input<string>('Esta acción no se puede deshacer.');
  confirmText = input<string>('Confirmar');
  cancelText = input<string>('Cancelar');
  isDestructive = input<boolean>(true);

  confirmed = output<void>();
  cancelled = output<void>();
}
