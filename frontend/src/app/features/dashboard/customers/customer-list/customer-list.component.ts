import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { RelativeTimePipe } from '../../../../shared/pipes/relative-time.pipe';
import { Customer } from '../../../../core/models';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, RelativeTimePipe],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Directorio de Clientes</h1>
          <p class="text-xs text-slate-500 mt-1">
            Historial de compradores, recurrencia de pedidos y volumen de compras.
          </p>
        </div>
      </div>

      <!-- Search Toolbar -->
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
            placeholder="Buscar por nombre, email o ciudad..."
            class="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
          />
        </div>
      </div>

      <!-- Customers Table -->
      <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase font-semibold text-slate-500">
              <tr>
                <th class="px-5 py-3.5">Cliente</th>
                <th class="px-5 py-3.5">Ubicación</th>
                <th class="px-5 py-3.5 text-center">Pedidos</th>
                <th class="px-5 py-3.5">Total Comprado</th>
                <th class="px-5 py-3.5">Última Compra</th>
                <th class="px-5 py-3.5 text-right">Contacto</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              @for (c of filteredCustomers(); track c.id) {
                <tr class="hover:bg-slate-50/70 transition-colors">
                  <td class="px-5 py-3.5 flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center flex-shrink-0">
                      {{ c.name.charAt(0) }}
                    </div>
                    <div>
                      <div class="font-bold text-slate-900">{{ c.name }}</div>
                      <div class="text-[11px] text-slate-400">{{ c.email || 'Sin correo' }}</div>
                    </div>
                  </td>
                  <td class="px-5 py-3.5">
                    <span class="text-slate-800 font-medium">{{ c.city }}</span>
                    <span class="text-slate-400 block text-[11px]">{{ c.department }}</span>
                  </td>
                  <td class="px-5 py-3.5 text-center">
                    <span class="inline-flex px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                      {{ c.totalOrders }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5 font-bold text-slate-900">
                    {{ c.totalSpent | appCurrency }}
                  </td>
                  <td class="px-5 py-3.5 text-slate-500">
                    {{ c.lastOrderDate | relativeTime }}
                  </td>
                  <td class="px-5 py-3.5 text-right">
                    <a
                      [href]="'https://wa.me/' + (c.phone?.replace('+', '')?.replace(' ', '') || '')"
                      target="_blank"
                      class="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      WhatsApp →
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class CustomerListComponent implements OnInit {
  readonly searchQuery = signal<string>('');
  readonly customers = signal<Customer[]>([
    {
      id: 'cust-1',
      name: 'Carolina Restrepo',
      email: 'caro.restrepo@gmail.com',
      phone: '+57 312 458 9210',
      city: 'Bogotá D.C.',
      department: 'Cundinamarca',
      totalOrders: 4,
      totalSpent: 756000,
      lastOrderDate: '2026-02-20T14:32:00Z'
    },
    {
      id: 'cust-2',
      name: 'Andrés Felipe Morales',
      email: 'andres.felipe@hotmail.com',
      phone: '+57 300 892 1144',
      city: 'Medellín',
      department: 'Antioquia',
      totalOrders: 2,
      totalSpent: 494900,
      lastOrderDate: '2026-02-20T11:15:00Z'
    },
    {
      id: 'cust-3',
      name: 'Valentina Ospina',
      email: 'valen.ospina@yahoo.com',
      phone: '+57 315 771 9088',
      city: 'Cali',
      department: 'Valle del Cauca',
      totalOrders: 3,
      totalSpent: 357000,
      lastOrderDate: '2026-02-19T09:40:00Z'
    },
    {
      id: 'cust-4',
      name: 'David Santiago Rivas',
      email: 'david.rivas@gmail.com',
      phone: '+57 320 654 3321',
      city: 'Barranquilla',
      department: 'Atlántico',
      totalOrders: 1,
      totalSpent: 159000,
      lastOrderDate: '2026-02-20T15:20:00Z'
    }
  ]);

  ngOnInit(): void {}

  readonly filteredCustomers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.customers();
    return this.customers().filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });
}
