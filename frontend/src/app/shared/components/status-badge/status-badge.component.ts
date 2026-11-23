import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusType = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'returned' | 'cancelled' | 'paid' | 'active' | 'inactive';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border transition-colors duration-150"
      [class]="badgeConfig().classes"
    >
      <span class="w-1.5 h-1.5 rounded-full" [class]="badgeConfig().dotClass"></span>
      {{ badgeConfig().label }}
    </span>
  `
})
export class StatusBadgeComponent {
  status = input.required<string>();

  readonly badgeConfig = computed(() => {
    const s = this.status().toLowerCase();
    switch (s) {
      case 'pending':
      case 'pendiente':
        return {
          label: 'Pendiente',
          classes: 'bg-amber-50 text-amber-700 border-amber-200',
          dotClass: 'bg-amber-500'
        };
      case 'confirmed':
      case 'confirmado':
        return {
          label: 'Confirmado',
          classes: 'bg-blue-50 text-blue-700 border-blue-200',
          dotClass: 'bg-blue-500'
        };
      case 'shipped':
      case 'enviado':
      case 'despachado':
        return {
          label: 'Enviado',
          classes: 'bg-purple-50 text-purple-700 border-purple-200',
          dotClass: 'bg-purple-500'
        };
      case 'delivered':
      case 'entregado':
        return {
          label: 'Entregado',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotClass: 'bg-emerald-500'
        };
      case 'returned':
      case 'devuelto':
        return {
          label: 'Devuelto',
          classes: 'bg-orange-50 text-orange-700 border-orange-200',
          dotClass: 'bg-orange-500'
        };
      case 'cancelled':
      case 'cancelado':
        return {
          label: 'Cancelado',
          classes: 'bg-rose-50 text-rose-700 border-rose-200',
          dotClass: 'bg-rose-500'
        };
      case 'paid':
      case 'pagado':
        return {
          label: 'Pagado',
          classes: 'bg-teal-50 text-teal-700 border-teal-200',
          dotClass: 'bg-teal-500'
        };
      case 'active':
      case 'activo':
      case 'true':
        return {
          label: 'Activo',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotClass: 'bg-emerald-500'
        };
      case 'inactive':
      case 'inactivo':
      case 'false':
        return {
          label: 'Inactivo',
          classes: 'bg-slate-100 text-slate-600 border-slate-200',
          dotClass: 'bg-slate-400'
        };
      default:
        return {
          label: this.status(),
          classes: 'bg-slate-50 text-slate-700 border-slate-200',
          dotClass: 'bg-slate-400'
        };
    }
  });
}
