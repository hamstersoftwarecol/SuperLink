import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Mobile backdrop -->
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        (click)="closeSidebar.emit()"
      ></div>
    }

    <!-- Sidebar Container -->
    <aside
      class="fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0"
      [class.translate-x-0]="isOpen()"
      [class.-translate-x-full]="!isOpen()"
    >
      <!-- Logo Header -->
      <div class="h-16 flex items-center justify-between px-6 border-b border-slate-800">
        <a routerLink="/dashboard" class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-base tracking-tight text-white">SuperLink</span>
            <span class="text-[10px] text-blue-400 font-medium uppercase tracking-wider">Commerce SaaS</span>
          </div>
        </a>
        <button
          type="button"
          (click)="closeSidebar.emit()"
          class="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        <div>
          <span class="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Plataforma</span>
          <nav class="mt-2 space-y-1">
            <a
              routerLink="/dashboard/overview"
              routerLinkActive="bg-blue-600 text-white font-medium"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="onNavClick()"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all duration-150"
            >
              <svg class="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              <span>Resumen</span>
            </a>

            <a
              routerLink="/dashboard/orders"
              routerLinkActive="bg-blue-600 text-white font-medium"
              (click)="onNavClick()"
              class="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all duration-150"
            >
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
                <span>Pedidos</span>
              </div>
              <span class="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full font-medium">12</span>
            </a>

            <a
              routerLink="/dashboard/products"
              routerLinkActive="bg-blue-600 text-white font-medium"
              (click)="onNavClick()"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all duration-150"
            >
              <svg class="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              <span>Productos</span>
            </a>

            <a
              routerLink="/dashboard/customers"
              routerLinkActive="bg-blue-600 text-white font-medium"
              (click)="onNavClick()"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all duration-150"
            >
              <svg class="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              <span>Clientes</span>
            </a>

            <a
              routerLink="/dashboard/analytics"
              routerLinkActive="bg-blue-600 text-white font-medium"
              (click)="onNavClick()"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all duration-150"
            >
              <svg class="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <span>Analítica</span>
            </a>
          </nav>
        </div>

        @if (canAccessAdmin()) {
          <div>
            <span class="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Administración</span>
            <nav class="mt-2 space-y-1">
              <a
                routerLink="/admin/users"
                routerLinkActive="bg-blue-600 text-white font-medium"
                (click)="onNavClick()"
                class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all duration-150"
              >
                <svg class="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <span>Usuarios</span>
              </a>

              <a
                routerLink="/admin/roles"
                routerLinkActive="bg-blue-600 text-white font-medium"
                (click)="onNavClick()"
                class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all duration-150"
              >
                <svg class="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                <span>Roles y Permisos</span>
              </a>

              <a
                routerLink="/admin/settings"
                routerLinkActive="bg-blue-600 text-white font-medium"
                (click)="onNavClick()"
                class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all duration-150"
              >
                <svg class="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>Configuración</span>
              </a>
            </nav>
          </div>
        }
      </div>

      <!-- User footer -->
      <div class="p-4 border-t border-slate-800 bg-slate-900/80">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold flex-shrink-0 text-white">
              @if (currentUser()?.avatarUrl) {
                <img [src]="currentUser()?.avatarUrl" alt="Avatar" class="w-9 h-9 rounded-full object-cover">
              } @else {
                {{ currentUser()?.name?.charAt(0) || 'U' }}
              }
            </div>
            <div class="overflow-hidden">
              <p class="text-sm font-medium text-white truncate">{{ currentUser()?.name || 'Usuario' }}</p>
              <p class="text-xs text-slate-400 capitalize truncate">{{ currentUser()?.role || 'vendedor' }}</p>
            </div>
          </div>
          <button
            type="button"
            (click)="onLogout()"
            title="Cerrar sesión"
            class="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);

  isOpen = input<boolean>(false);
  closeSidebar = output<void>();

  readonly currentUser = this.auth.currentUser;

  canAccessAdmin(): boolean {
    return this.auth.hasRole(['admin', 'super_admin']);
  }

  onNavClick(): void {
    this.closeSidebar.emit();
  }

  onLogout(): void {
    this.auth.logout();
  }
}
