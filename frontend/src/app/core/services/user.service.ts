import { Injectable, inject } from '@angular/core';
import { Observable, of, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly api = inject(ApiService);

  private mockUsers: User[] = [
    {
      id: 'usr-1',
      tenantId: 'ten-superlink',
      email: 'alejandro@superlink.co',
      name: 'Alejandro Morales',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
      role: 'super_admin',
      provider: 'google',
      isActive: true,
      createdAt: '2026-01-10T08:00:00Z'
    },
    {
      id: 'usr-2',
      tenantId: 'ten-superlink',
      email: 'camila.admin@superlink.co',
      name: 'Camila Rodriguez',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
      role: 'admin',
      provider: 'email',
      isActive: true,
      createdAt: '2026-01-15T10:30:00Z'
    },
    {
      id: 'usr-3',
      tenantId: 'ten-superlink',
      email: 'sebastian.sales@superlink.co',
      name: 'Sebastián Gómez',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
      role: 'vendedor',
      provider: 'email',
      isActive: true,
      createdAt: '2026-02-01T14:20:00Z'
    },
    {
      id: 'usr-4',
      tenantId: 'ten-superlink',
      email: 'lucia.ops@superlink.co',
      name: 'Lucía Fernández',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop',
      role: 'operador',
      provider: 'email',
      isActive: true,
      createdAt: '2026-02-10T11:00:00Z'
    },
    {
      id: 'usr-5',
      tenantId: 'ten-superlink',
      email: 'analista@superlink.co',
      name: 'Mateo Vargas',
      role: 'viewer',
      provider: 'email',
      isActive: false,
      createdAt: '2026-02-18T16:45:00Z'
    }
  ];

  getUsers(): Observable<User[]> {
    return this.api.get<User[]>('/users').pipe(
      catchError(() => of(this.mockUsers))
    );
  }

  getUserById(id: string): Observable<User | null> {
    return this.api.get<User>(`/users/${id}`).pipe(
      catchError(() => of(this.mockUsers.find(u => u.id === id) || null))
    );
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.api.post<User>('/users', user).pipe(
      catchError(() => {
        const newUser: User = {
          id: 'usr-' + Date.now(),
          tenantId: user.tenantId || 'ten-superlink',
          email: user.email || '',
          name: user.name || '',
          role: user.role || 'vendedor',
          provider: 'email',
          isActive: user.isActive !== undefined ? user.isActive : true,
          createdAt: new Date().toISOString()
        };
        this.mockUsers.push(newUser);
        return of(newUser);
      })
    );
  }

  updateUser(id: string, updates: Partial<User>): Observable<User> {
    return this.api.put<User>(`/users/${id}`, updates).pipe(
      catchError(() => {
        const idx = this.mockUsers.findIndex(u => u.id === id);
        if (idx !== -1) {
          this.mockUsers[idx] = { ...this.mockUsers[idx], ...updates };
          return of(this.mockUsers[idx]);
        }
        return of({ ...updates, id } as User);
      })
    );
  }

  deleteUser(id: string): Observable<{ success: boolean }> {
    return this.api.delete<{ success: boolean }>(`/users/${id}`).pipe(
      catchError(() => {
        this.mockUsers = this.mockUsers.filter(u => u.id !== id);
        return of({ success: true });
      })
    );
  }
}
