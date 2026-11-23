import { Injectable, inject } from '@angular/core';
import { Observable, of, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { DashboardStats } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly api = inject(ApiService);

  private mockStats: DashboardStats = {
    totalOrders: 1482,
    totalRevenue: 284500000,
    conversionRate: 4.8,
    avgOrderValue: 191970,
    ordersChange: 18.4,
    revenueChange: 24.2
  };

  getStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('/dashboard/stats').pipe(
      catchError(() => of(this.mockStats))
    );
  }

  getWeeklyTrends(): Observable<{ day: string; orders: number; revenue: number }[]> {
    return this.api.get<any[]>('/dashboard/trends').pipe(
      catchError(() => of([
        { day: 'Lun', orders: 182, revenue: 34900000 },
        { day: 'Mar', orders: 215, revenue: 41200000 },
        { day: 'Mié', orders: 198, revenue: 38100000 },
        { day: 'Jue', orders: 245, revenue: 47200000 },
        { day: 'Vie', orders: 290, revenue: 55800000 },
        { day: 'Sáb', orders: 212, revenue: 40600000 },
        { day: 'Dom', orders: 140, revenue: 26700000 }
      ]))
    );
  }
}
