import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <!-- Left side: Hamburger & Store Info -->
      <div class="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          (click)="toggleSidebar.emit()"
          class="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <div class="flex items-center gap-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Tienda Principal
          </span>
          <span class="hidden sm:inline-block text-xs text-slate-400">• Plan Pro Activo</span>
        </div>
      </div>

      <!-- Center: Search input -->
      <div class="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div class="relative w-full">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar pedidos, clientes, guías..."
            class="block w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      <!-- Right side: Notifications & User profile -->
      <div class="flex items-center gap-3">
        <!-- Notifications button -->
        <div class="relative">
          <button
            type="button"
            (click)="toggleNotifications()"
            class="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 relative transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
          </button>

          <!-- Notification Dropdown -->
          @if (showNotifications()) {
            <div class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
              <div class="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-800">Notificaciones</span>
                <span class="text-[10px] text-blue-600 cursor-pointer font-medium">Marcar leídas</span>
              </div>
              <div class="max-h-64 overflow-y-auto divide-y divide-slate-50">
                <div class="p-3 hover:bg-slate-50 transition-colors">
                  <p class="text-xs font-medium text-slate-800">📦 Nuevo pedido confirmado #ORD-9821</p>
                  <p class="text-[11px] text-slate-400 mt-0.5">Hace 5 minutos • Depiladora Láser IPL</p>
                </div>
                <div class="p-3 hover:bg-slate-50 transition-colors">
                  <p class="text-xs font-medium text-slate-800">🚚 Guía generada #ENV-CO-984321</p>
                  <p class="text-[11px] text-slate-400 mt-0.5">Hace 25 minutos • Transportadora Coordinadora</p>
                </div>
                <div class="p-3 hover:bg-slate-50 transition-colors">
                  <p class="text-xs font-medium text-slate-800">⚠️ Stock bajo en Mini Proyector</p>
                  <p class="text-[11px] text-slate-400 mt-0.5">Quedan sólo 18 unidades disponibles</p>
                </div>
              </div>
            </div>
          }
        </div>

        <div class="h-6 w-px bg-slate-200"></div>

        <!-- User profile button -->
        <div class="relative">
          <button
            type="button"
            (click)="toggleUserMenu()"
            class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              @if (currentUser()?.avatarUrl) {
                <img [src]="currentUser()?.avatarUrl" alt="Avatar" class="w-8 h-8 rounded-full object-cover">
              } @else {
                {{ currentUser()?.name?.charAt(0) || 'A' }}
              }
            </div>
            <span class="hidden sm:inline-block text-sm font-medium text-slate-700">
              {{ currentUser()?.name || 'Administrador' }}
            </span>
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <!-- User Menu Dropdown -->
          @if (showUserMenu()) {
            <div class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
              <div class="px-4 py-2 border-b border-slate-100">
                <p class="text-xs font-semibold text-slate-800">{{ currentUser()?.name }}</p>
                <p class="text-[11px] text-slate-400 truncate">{{ currentUser()?.email }}</p>
              </div>
              <a
                routerLink="/admin/settings"
                (click)="showUserMenu.set(false)"
                class="flex items-center gap-2 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Configuración
              </a>
              <button
                type="button"
                (click)="logout()"
                class="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `
})
export class TopbarComponent {
  private readonly auth = inject(AuthService);

  toggleSidebar = output<void>();

  readonly currentUser = this.auth.currentUser;
  readonly showNotifications = signal<boolean>(false);
  readonly showUserMenu = signal<boolean>(false);

  toggleNotifications(): void {
    this.showNotifications.update(v => !v);
    this.showUserMenu.set(false);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
    this.showNotifications.set(false);
  }

  logout(): void {
    this.showUserMenu.set(false);
    this.auth.logout();
  }
}
