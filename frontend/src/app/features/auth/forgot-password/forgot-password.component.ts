import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <a routerLink="/" class="flex items-center justify-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/25">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <span class="font-bold text-2xl tracking-tight text-slate-900">SuperLink</span>
        </a>
        <h2 class="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900">
          Recuperar contraseña
        </h2>
        <p class="mt-2 text-center text-sm text-slate-500">
          Ingresa tu correo y te enviaremos un enlace para restablecer tu acceso.
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div class="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-100 rounded-2xl">
          @if (submitted()) {
            <div class="text-center">
              <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h3 class="text-base font-bold text-slate-900">¡Enlace enviado!</h3>
              <p class="mt-2 text-xs text-slate-600 leading-relaxed">
                Hemos enviado instrucciones de recuperación a
                <strong class="text-slate-800">{{ form.get('email')?.value }}</strong>.
                Revisa tu bandeja de entrada y spam.
              </p>
              <a
                routerLink="/login"
                class="mt-6 inline-block w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Volver al inicio de sesión
              </a>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
              <div>
                <label for="email" class="block text-xs font-semibold text-slate-700">Correo Electrónico</label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="ejemplo@mitienda.com"
                  class="mt-1 block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div class="pt-2">
                <button
                  type="submit"
                  [disabled]="form.invalid || loading()"
                  class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-150"
                >
                  {{ loading() ? 'Enviando...' : 'Enviar enlace de recuperación' }}
                </button>
              </div>
            </form>

            <div class="mt-6 text-center text-xs text-slate-500">
              <a routerLink="/login" class="font-medium text-blue-600 hover:text-blue-500 underline underline-offset-4">
                ← Volver al login
              </a>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);

  readonly loading = signal<boolean>(false);
  readonly submitted = signal<boolean>(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);

    setTimeout(() => {
      this.loading.set(false);
      this.submitted.set(true);
    }, 600);
  }
}
