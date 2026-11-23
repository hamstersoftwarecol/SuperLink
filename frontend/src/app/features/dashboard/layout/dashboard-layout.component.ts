import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="min-h-screen bg-slate-50 flex">
      <!-- Sidebar Component -->
      <app-sidebar
        [isOpen]="sidebarOpen()"
        (closeSidebar)="sidebarOpen.set(false)"
      />

      <!-- Main Content Layout Area -->
      <div class="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        <!-- Topbar -->
        <app-topbar
          (toggleSidebar)="toggleSidebar()"
        />

        <!-- Page Dynamic View -->
        <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class DashboardLayoutComponent {
  readonly sidebarOpen = signal<boolean>(false);

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }
}
