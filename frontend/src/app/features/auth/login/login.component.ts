import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
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
          Iniciar sesión en tu cuenta
        </h2>
        <p class="mt-2 text-center text-sm text-slate-500">
          O
          <a routerLink="/register" class="font-medium text-blue-600 hover:text-blue-500 underline underline-offset-4">
            crea una tienda gratis por 14 días
          </a>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div class="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-100 rounded-2xl">
          <!-- Google OAuth Button -->
          <div>
            <button
              type="button"
              (click)="loginWithGoogle()"
              [disabled]="loading()"
              class="w-full flex justify-center items-center gap-3 px-4 py-2.5 border border-slate-300 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 disabled:opacity-50"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continuar con Google</span>
            </button>
          </div>

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-200"></div>
            </div>
            <div class="relative flex justify-center text-xs uppercase tracking-wider">
              <span class="bg-white px-3 text-slate-400 font-semibold">O con email</span>
            </div>
          </div>

          <!-- Alert message -->
          @if (errorMessage()) {
            <div class="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label for="email" class="block text-xs font-semibold text-slate-700">Correo Electrónico</label>
              <div class="mt-1">
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="ejemplo@mitienda.com"
                  autocomplete="email"
                  class="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  [class.border-rose-400]="form.get('email')?.touched && form.get('email')?.invalid"
                />
              </div>
              @if (form.get('email')?.touched && form.get('email')?.hasError('required')) {
                <span class="text-xs text-rose-600 mt-1 block">El correo es obligatorio.</span>
              }
              @if (form.get('email')?.touched && form.get('email')?.hasError('email')) {
                <span class="text-xs text-rose-600 mt-1 block">Ingresa un correo electrónico válido.</span>
              }
            </div>

            <div>
              <div class="flex items-center justify-between">
                <label for="password" class="block text-xs font-semibold text-slate-700">Contraseña</label>
                <a routerLink="/forgot-password" class="text-xs font-medium text-blue-600 hover:text-blue-500">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div class="mt-1">
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  class="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  [class.border-rose-400]="form.get('password')?.touched && form.get('password')?.invalid"
                />
              </div>
              @if (form.get('password')?.touched && form.get('password')?.hasError('required')) {
                <span class="text-xs text-rose-600 mt-1 block">La contraseña es obligatoria.</span>
              }
            </div>

            <div class="pt-2">
              <button
                type="submit"
                [disabled]="form.invalid || loading()"
                class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-150"
              >
                @if (loading()) {
                  <span class="inline-flex items-center gap-2">
                    <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Ingresando...
                  </span>
                } @else {
                  Ingresar
                }
              </button>
            </div>
          </form>

          <div class="mt-6 text-center text-xs text-slate-500">
            ¿No tienes cuenta?
            <a routerLink="/register" class="font-medium text-blue-600 hover:text-blue-500 underline underline-offset-4">
              Regístrate aquí
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    email: ['demo@superlink.co', [Validators.required, Validators.email]],
    password: ['password123', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.value;

    this.auth.login(email!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard/overview';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      }
    });
  }

  loginWithGoogle(): void {
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
