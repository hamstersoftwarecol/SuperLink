import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface RoleDef {
  name: string;
  role: string;
  description: string;
  usersCount: number;
  permissions: {
    dashboard: boolean;
    ordersRead: boolean;
    ordersEdit: boolean;
    products: boolean;
    customers: boolean;
    adminUsers: boolean;
    settings: boolean;
  };
}

@Component({
  selector: 'app-role-manager',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">Roles y Matriz de Permisos (RBAC)</h1>
        <p class="text-xs text-slate-500 mt-1">
          Configuración de control de acceso granular basado en roles para el equipo de trabajo.
        </p>
      </div>

      <!-- Role cards summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        @for (r of roles; track r.role) {
          <div class="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <span class="text-xs font-bold uppercase tracking-wider text-blue-600">{{ r.name }}</span>
            <div class="mt-2 text-xl font-bold text-slate-900">{{ r.usersCount }} miembros</div>
            <p class="mt-1 text-[11px] text-slate-500 line-clamp-2">{{ r.description }}</p>
          </div>
        }
      </div>

      <!-- Permissions Matrix Table -->
      <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-100">
          <h2 class="text-sm font-bold text-slate-900">Matriz de Acceso por Módulo</h2>
          <p class="text-xs text-slate-400 mt-0.5">Permisos efectivos por cada rol en la plataforma</p>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase font-semibold text-slate-500">
              <tr>
                <th class="px-5 py-3.5">Módulo / Permiso</th>
                <th class="px-4 py-3.5 text-center">Super Admin</th>
                <th class="px-4 py-3.5 text-center">Admin</th>
                <th class="px-4 py-3.5 text-center">Vendedor</th>
                <th class="px-4 py-3.5 text-center">Operador</th>
                <th class="px-4 py-3.5 text-center">Viewer</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              <tr class="hover:bg-slate-50/70 transition-colors">
                <td class="px-5 py-3.5 font-semibold text-slate-900">Ver Dashboard y KPIs Financieros</td>
                <td class="px-4 py-3.5 text-center text-emerald-600">✔</td>
                <td class="px-4 py-3.5 text-center text-emerald-600">✔</td>
                <td class="px-4 py-3.5 text-center text-slate-300">—</td>
                <td class="px-4 py-3.5 text-center text-slate-300">—</td>
                <td class="px-4 py-3.5 text-center text-emerald-600">✔</td>
              </tr>
              <tr class="hover:bg-slate-50/70 transition-colors">
                <td class="px-5 py-3.5 font-semibold text-slate-900">Visualizar Pedidos</td>
                <td class="px-4 py-3.5 text-center text-emerald-600">✔</td>
                <td class="px-4 py-3.5 text-center text-emerald-600">✔</td>
                <td class="px-4 py-3.5 text-center text-emerald-600">✔</td>
                <td class="px-4 py-3.5 text-center text-emerald-600">✔</td>
                <td class="px-4 py-3.5 text-center text-emerald-600">✔</td>
              </tr>
              <tr class="hover:bg-slate-50/70 transition-colors">
                <td class="px-5 py-3.5 font-semibold text-slate-900">Confirmar y Despachar Pedidos (Cambio de Estado)</td>
                <td class="px-4 py-3.5 text-center text-emerald-600">✔</td>
                <td class="px-4 py-3.5 text-center text-emerald-600">✔</td>
                <td class="px-4 py-3.5 text-center text-emerald-600">✔</td>
                <td class="px-4 py-3.5 text-center text-emerald-600">✔</td>
                <td class="px-4 py-3.5 text-center text-slate-300">—</td>
              </tr>
              <tr class="hover:bg-slate-50/70 transition-colors">
                <td class="px-5 py-3.5 font-semibold text-slate-900">Crear y Editar Productos / Precios</td>
                <td class="px-4 py-3.5 text-center text-emerald-600">✔</td>
                <td class="px-4 py-3.5 text-center text-emerald-600">✔</td>
                <td class="px-4 py-3.5 text-center text-slate-300">—</td>
                <td class="px-4 py-3.5 text-center text-slate-300">—</td>
                <td class="px-4 py-3.5 text-center text-slate-300">—</td>
              </tr>
              <tr class="hover:bg-slate-50/70 transition-colors">
                <td class="px-5 py-3.5 font-semibold text-slate-900">Directorio y Datos de Clientes</td>
                <td class="px-4 py-3.5 text-center text-emerald-600">✔</td>
                <td class="px-4 py-3.5 text-center text-emerald-600">✔</td>
                <td class="px-4 py-3.5 text-center text-emerald-600">✔</td>
                <td class="px-4 py-3.5 text-center text-slate-300">—</td>
                <td class="px-4 py-3.5 text-center text-slate-300">—</td>
              </tr>
              <tr class="hover:bg-slate-50/70 transition-colors">
                <td class="px-5 py-3.5 font-semibold text-slate-900">Gestión de Usuarios y Asignación de Roles</td>
                <td class="px-4 py-3.5 text-center text-emerald-600">✔</td>
                <td class="px-4 py-3.5 text-center text-emerald-600">✔</td>
                <td class="px-4 py-3.5 text-center text-slate-300">—</td>
                <td class="px-4 py-3.5 text-center text-slate-300">—</td>
                <td class="px-4 py-3.5 text-center text-slate-300">—</td>
              </tr>
              <tr class="hover:bg-slate-50/70 transition-colors">
                <td class="px-5 py-3.5 font-semibold text-slate-900">Configuraciones de la Tienda y Pasarelas</td>
                <td class="px-4 py-3.5 text-center text-emerald-600">✔</td>
                <td class="px-4 py-3.5 text-center text-emerald-600">✔</td>
                <td class="px-4 py-3.5 text-center text-slate-300">—</td>
                <td class="px-4 py-3.5 text-center text-slate-300">—</td>
                <td class="px-4 py-3.5 text-center text-slate-300">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class RoleManagerComponent {
  readonly roles: RoleDef[] = [
    {
      name: 'Super Admin',
      role: 'super_admin',
      description: 'Acceso total sin restricciones a nivel de organización.',
      usersCount: 1,
      permissions: { dashboard: true, ordersRead: true, ordersEdit: true, products: true, customers: true, adminUsers: true, settings: true }
    },
    {
      name: 'Admin',
      role: 'admin',
      description: 'Administración completa de tienda, usuarios y catálogo.',
      usersCount: 1,
      permissions: { dashboard: true, ordersRead: true, ordersEdit: true, products: true, customers: true, adminUsers: true, settings: true }
    },
    {
      name: 'Vendedor',
      role: 'vendedor',
      description: 'Confirmación telefónica y por WhatsApp de pedidos pendientes.',
      usersCount: 1,
      permissions: { dashboard: false, ordersRead: true, ordersEdit: true, products: false, customers: true, adminUsers: false, settings: false }
    },
    {
      name: 'Operador',
      role: 'operador',
      description: 'Empaque, impresión de rótulos y despacho a transportadora.',
      usersCount: 1,
      permissions: { dashboard: false, ordersRead: true, ordersEdit: true, products: false, customers: false, adminUsers: false, settings: false }
    },
    {
      name: 'Viewer',
      role: 'viewer',
      description: 'Auditoría y solo lectura de reportes financieros y pedidos.',
      usersCount: 1,
      permissions: { dashboard: true, ordersRead: true, ordersEdit: false, products: false, customers: false, adminUsers: false, settings: false }
    }
  ];
}
