import { Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (item: T) => string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <!-- Table Wrapper -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50 border-b border-slate-100 text-xs uppercase font-semibold text-slate-500">
            <tr>
              @for (col of columns(); track col.key) {
                <th
                  scope="col"
                  class="px-5 py-3.5"
                  [class.text-right]="col.align === 'right'"
                  [class.text-center]="col.align === 'center'"
                  [class.cursor-pointer]="col.sortable"
                  [class.select-none]="col.sortable"
                  (click)="handleSort(col)"
                >
                  <div class="inline-flex items-center gap-1.5" [class.justify-end]="col.align === 'right'">
                    <span>{{ col.label }}</span>
                    @if (col.sortable) {
                      <span class="text-slate-400">
                        @if (sortKey() === col.key) {
                          @if (sortDirection() === 'asc') {
                            ▲
                          } @else {
                            ▼
                          }
                        } @else {
                          ⇅
                        }
                      </span>
                    }
                  </div>
                </th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (item of paginatedData(); track $index) {
              <tr class="hover:bg-slate-50/70 transition-colors">
                @for (col of columns(); track col.key) {
                  <td
                    class="px-5 py-4 whitespace-nowrap text-slate-700"
                    [class.text-right]="col.align === 'right'"
                    [class.text-center]="col.align === 'center'"
                  >
                    @if (col.render) {
                      {{ col.render(item) }}
                    } @else {
                      {{ getCellValue(item, col.key) }}
                    }
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td [attr.colspan]="columns().length" class="px-5 py-8 text-center text-slate-400 text-sm">
                  No hay datos disponibles en esta tabla.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      @if (data().length > pageSize()) {
        <div class="flex items-center justify-between px-5 py-3 bg-white border-t border-slate-100 text-sm">
          <span class="text-xs text-slate-500">
            Mostrando
            <span class="font-medium text-slate-800">{{ (currentPage() - 1) * pageSize() + 1 }}</span>
            a
            <span class="font-medium text-slate-800">{{ Math.min(currentPage() * pageSize(), data().length) }}</span>
            de
            <span class="font-medium text-slate-800">{{ data().length }}</span>
            resultados
          </span>
          <div class="flex items-center gap-1">
            <button
              type="button"
              (click)="setPage(currentPage() - 1)"
              [disabled]="currentPage() === 1"
              class="px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            @for (p of totalPagesArray(); track p) {
              <button
                type="button"
                (click)="setPage(p)"
                class="w-7 h-7 text-xs rounded-lg font-medium transition-colors"
                [class.bg-blue-600]="currentPage() === p"
                [class.text-white]="currentPage() === p"
                [class.text-slate-600]="currentPage() !== p"
                [class.hover:bg-slate-100]="currentPage() !== p"
              >
                {{ p }}
              </button>
            }
            <button
              type="button"
              (click)="setPage(currentPage() + 1)"
              [disabled]="currentPage() === totalPages()"
              class="px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class DataTableComponent<T = any> {
  columns = input.required<TableColumn<T>[]>();
  data = input.required<T[]>();
  pageSize = input<number>(10);

  protected readonly Math = Math;

  readonly sortKey = signal<string | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly currentPage = signal<number>(1);

  getCellValue(item: any, key: string): any {
    return item ? item[key] : '';
  }

  handleSort(col: TableColumn<T>): void {
    if (!col.sortable) return;
    if (this.sortKey() === col.key) {
      if (this.sortDirection() === 'asc') {
        this.sortDirection.set('desc');
      } else {
        this.sortKey.set(null);
      }
    } else {
      this.sortKey.set(col.key);
      this.sortDirection.set('asc');
    }
  }

  readonly sortedData = computed(() => {
    const items = [...this.data()];
    const key = this.sortKey();
    const dir = this.sortDirection();

    if (!key) return items;

    return items.sort((a: any, b: any) => {
      const valA = a[key];
      const valB = b[key];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      const compare = valA > valB ? 1 : -1;
      return dir === 'asc' ? compare : -compare;
    });
  });

  readonly totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.data().length / this.pageSize()));
  });

  readonly totalPagesArray = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  readonly paginatedData = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.sortedData().slice(start, start + this.pageSize());
  });

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}
