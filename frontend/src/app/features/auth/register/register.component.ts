import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <!-- Logo -->
        <a routerLink="/" class="flex items-center justify-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/25">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <span class="font-bold text-2xl tracking-tight text-slate-900">SuperLink</span>
        </a>
        <h2 class="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900">
          Crea tu tienda en SuperLink
        </h2>
        <p class="mt-2 text-center text-sm text-slate-500">
          14 días gratis sin tarjeta de crédito.
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div class="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-100 rounded-2xl">
          <!-- Google OAuth Button -->
          <div>
            <button
              type="button"
              (click)="signupWithGoogle()"
              [disabled]="loading()"
              class="w-full flex justify-center items-center gap-3 px-4 py-2.5 border border-slate-300 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 disabled:opacity-50"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Registrarse con Google</span>
            </button>
          </div>

          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-200"></div>
            </div>
            <div class="relative flex justify-center text-xs uppercase tracking-wider">
              <span class="bg-white px-3 text-slate-400 font-semibold">O completa el formulario</span>
            </div>
          </div>

          @if (errorMessage()) {
            <div class="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label for="name" class="block text-xs font-semibold text-slate-700">Tu Nombre Completo</label>
              <input
                id="name"
                type="text"
                formControlName="name"
                placeholder="Carlos Pérez"
                class="mt-1 block w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label for="storeName" class="block text-xs font-semibold text-slate-700">Nombre de tu Tienda</label>
              <input
                id="storeName"
                type="text"
                formControlName="storeName"
                placeholder="Mi Tienda Express"
                class="mt-1 block w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label for="reg-email" class="block text-xs font-semibold text-slate-700">Correo Electrónico</label>
              <input
                id="reg-email"
                type="email"
                formControlName="email"
                placeholder="carlos@mitienda.com"
                class="mt-1 block w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label for="reg-password" class="block text-xs font-semibold text-slate-700">Contraseña</label>
              <input
                id="reg-password"
                type="password"
                formControlName="password"
                placeholder="Al menos 8 caracteres"
                class="mt-1 block w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label for="confirmPassword" class="block text-xs font-semibold text-slate-700">Confirmar Contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                placeholder="Repite tu contraseña"
                class="mt-1 block w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div class="flex items-center">
              <input
                id="terms"
                type="checkbox"
                formControlName="acceptTerms"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <label for="terms" class="ml-2 block text-xs text-slate-600">
                Acepto los términos del servicio y política de privacidad.
              </label>
            </div>

            <div class="pt-2">
              <button
                type="submit"
                [disabled]="form.invalid || loading()"
                class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-150"
              >
                @if (loading()) {
                  <span>Creando cuenta...</span>
                } @else {
                  Crear Mi Tienda Gratis
                }
              </button>
            </div>
          </form>

          <div class="mt-6 text-center text-xs text-slate-500">
            ¿Ya tienes una cuenta?
            <a routerLink="/login" class="font-medium text-blue-600 hover:text-blue-500 underline underline-offset-4">
              Inicia sesión aquí
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    storeName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    acceptTerms: [true, [Validators.requiredTrue]]
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    const { name, storeName, email, password, confirmPassword } = this.form.value;
    if (password !== confirmPassword) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.auth.register(name!, email!, password!, storeName!).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard/overview']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Error al registrar la cuenta.');
      }
    });
  }

  signupWithGoogle(): void {
    this.loading.set(true);
    this.auth.loginWithGoogle('mock-google-token').subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard/overview']);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Error con autenticación de Google');
      }
    });
  }
}
