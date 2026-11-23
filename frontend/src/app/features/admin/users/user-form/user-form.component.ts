import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="flex items-center gap-3">
        <a
          routerLink="/admin/users"
          class="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
        </a>
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">
            {{ isEditMode() ? 'Editar Usuario' : 'Crear Usuario' }}
          </h1>
          <p class="text-xs text-slate-500 mt-0.5">Asigna rol y permisos para este usuario en el sistema.</p>
        </div>
      </div>

      @if (initialLoading()) {
        <app-loading-spinner message="Cargando información del usuario..." />
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-white rounded-xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-5">
          <div>
            <label for="name" class="block text-xs font-semibold text-slate-700">Nombre Completo *</label>
            <input
              id="name"
              type="text"
              formControlName="name"
              placeholder="Ej. Sofía Mendoza"
              class="mt-1 block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label for="email" class="block text-xs font-semibold text-slate-700">Correo Electrónico *</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="sofia@superlink.co"
              class="mt-1 block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label for="role" class="block text-xs font-semibold text-slate-700">Rol Asignado *</label>
            <select
              id="role"
              formControlName="role"
              class="mt-1 block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="super_admin">Super Admin (Control Total)</option>
              <option value="admin">Admin (Gestión Tienda)</option>
              <option value="vendedor">Vendedor (Confirmaciones WhatsApp)</option>
              <option value="operador">Operador (Despachos y Guías)</option>
              <option value="viewer">Viewer (Solo lectura)</option>
            </select>
            <p class="text-[11px] text-slate-400 mt-1">
              Determina los módulos visibles en la barra lateral y los permisos de edición.
            </p>
          </div>

          <div class="pt-2 flex items-center">
            <input
              id="isActive"
              type="checkbox"
              formControlName="isActive"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label for="isActive" class="ml-2 block text-xs font-semibold text-slate-700">
              Usuario activo (puede iniciar sesión en la plataforma)
            </label>
          </div>

          <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <a
              routerLink="/admin/users"
              class="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </a>
            <button
              type="submit"
              [disabled]="form.invalid || saving()"
              class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 disabled:opacity-50 transition-all"
            >
              {{ saving() ? 'Guardando...' : (isEditMode() ? 'Actualizar Usuario' : 'Crear Usuario') }}
            </button>
          </div>
        </form>
      }
    </div>
  `
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  readonly isEditMode = signal<boolean>(false);
  readonly initialLoading = signal<boolean>(false);
  readonly saving = signal<boolean>(false);
  private userId: string | null = null;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['vendedor' as User['role'], [Validators.required]],
    isActive: [true]
  });

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId && this.userId !== 'new') {
      this.isEditMode.set(true);
      this.initialLoading.set(true);
      this.userService.getUserById(this.userId).subscribe({
        next: (u) => {
          if (u) {
            this.form.patchValue({
              name: u.name,
              email: u.email,
              role: u.role,
              isActive: u.isActive
            });
          }
          this.initialLoading.set(false);
        },
        error: () => this.initialLoading.set(false)
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const formVal = this.form.value;

    if (this.isEditMode() && this.userId) {
      this.userService.updateUser(this.userId, formVal as any).subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(['/admin/users']);
        },
        error: () => this.saving.set(false)
      });
    } else {
      this.userService.createUser(formVal as any).subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(['/admin/users']);
        },
        error: () => this.saving.set(false)
      });
    }
  }
}
