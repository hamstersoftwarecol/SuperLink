import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center p-8 text-center" [class]="containerClass()">
      <div class="relative w-10 h-10">
        <div class="w-10 h-10 rounded-full border-4 border-slate-200"></div>
        <div class="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      @if (message()) {
        <p class="mt-3 text-sm font-medium text-slate-500">{{ message() }}</p>
      }
    </div>
  `
})
export class LoadingSpinnerComponent {
  message = input<string>('Cargando información...');
  containerClass = input<string>('');
}
