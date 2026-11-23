import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { RelativeTimePipe } from '../../../../shared/pipes/relative-time.pipe';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StatusBadgeComponent, LoadingSpinnerComponent, RelativeTimePipe],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Gestión de Usuarios</h1>
          <p class="text-xs text-slate-500 mt-1">
            Administra miembros del equipo, roles de acceso y operadores de despacho.
          </p>
        </div>
        <div>
          <a
            routerLink="/admin/users/new"
            class="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all"
          >
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nuevo Usuario
          </a>
        </div>
      </div>

      <!-- Filter bar -->
      <div class="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex items-center justify-between">
        <div class="relative w-full sm:w-80">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Buscar por nombre o correo..."
            class="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
          />
        </div>
      </div>

      <!-- Users Table -->
      @if (loading()) {
        <app-loading-spinner message="Cargando usuarios..." />
      } @else {
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-600">
              <thead class="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase font-semibold text-slate-500">
                <tr>
                  <th class="px-5 py-3.5">Usuario</th>
                  <th class="px-5 py-3.5">Rol de Acceso</th>
                  <th class="px-5 py-3.5">Proveedor</th>
                  <th class="px-5 py-3.5">Estado</th>
                  <th class="px-5 py-3.5">Fecha Creación</th>
                  <th class="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs">
                @for (u of filteredUsers(); track u.id) {
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    <td class="px-5 py-3.5 flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">
                        @if (u.avatarUrl) {
                          <img [src]="u.avatarUrl" alt="" class="w-9 h-9 rounded-full object-cover">
                        } @else {
                          {{ u.name.charAt(0) }}
                        }
                      </div>
                      <div>
                        <div class="font-bold text-slate-900">{{ u.name }}</div>
                        <div class="text-[11px] text-slate-400">{{ u.email }}</div>
                      </div>
                    </td>
                    <td class="px-5 py-3.5">
                      <span
                        class="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                        [class.bg-purple-50]="u.role === 'super_admin'"
                        [class.text-purple-700]="u.role === 'super_admin'"
                        [class.bg-blue-50]="u.role === 'admin'"
                        [class.text-blue-700]="u.role === 'admin'"
                        [class.bg-emerald-50]="u.role === 'vendedor'"
                        [class.text-emerald-700]="u.role === 'vendedor'"
                        [class.bg-amber-50]="u.role === 'operador'"
                        [class.text-amber-700]="u.role === 'operador'"
                        [class.bg-slate-100]="u.role === 'viewer'"
                        [class.text-slate-600]="u.role === 'viewer'"
                      >
                        {{ u.role }}
                      </span>
                    </td>
                    <td class="px-5 py-3.5 capitalize text-slate-600 font-medium">
                      {{ u.provider }}
                    </td>
                    <td class="px-5 py-3.5">
                      <app-status-badge [status]="u.isActive ? 'active' : 'inactive'" />
                    </td>
                    <td class="px-5 py-3.5 text-slate-500">
                      {{ u.createdAt | relativeTime }}
                    </td>
                    <td class="px-5 py-3.5 text-right">
                      <a
                        [routerLink]="['/admin/users', u.id]"
                        class="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Editar
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);

  readonly users = signal<User[]>([]);
  readonly loading = signal<boolean>(true);
  readonly searchQuery = signal<string>('');

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (list) => {
        this.users.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  readonly filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.users();
    return this.users().filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });
}
