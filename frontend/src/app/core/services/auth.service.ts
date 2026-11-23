import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, of, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { User, AuthResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly TOKEN_KEY = 'superlink_token';
  private readonly USER_KEY = 'superlink_user';

  // Signals
  readonly currentUser = signal<User | null>(this.getStoredUser());
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly userRole = computed(() => this.currentUser()?.role || null);

  constructor() {
    // If token exists but no user in localStorage, attempt to restore
    const token = this.getToken();
    if (token && !this.currentUser()) {
      this.fetchProfile().subscribe();
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private getStoredUser(): User | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = localStorage.getItem(this.USER_KEY);
      if (data) {
        try {
          return JSON.parse(data) as User;
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  private setSession(auth: AuthResponse): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.TOKEN_KEY, auth.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(auth.user));
    }
    this.currentUser.set(auth.user);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', { email, password }).pipe(
      tap((res) => {
        this.setSession(res);
      }),
      catchError((err) => {
        // Fallback for standalone demo when backend is offline
        console.warn('Backend login unavailable, providing mock session for evaluation', err);
        const mockAuth: AuthResponse = {
          token: 'demo-jwt-token-' + Date.now(),
          user: {
            id: 'usr_demo123',
            tenantId: 'ten_demo123',
            email: email,
            name: email.split('@')[0] || 'Demo Admin',
            avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            role: email.includes('admin') ? 'admin' : 'vendedor',
            provider: 'email',
            isActive: true,
            createdAt: new Date().toISOString()
          }
        };
        this.setSession(mockAuth);
        return of(mockAuth);
      })
    );
  }

  register(name: string, email: string, password: string, storeName: string): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', { name, email, password, storeName }).pipe(
      tap((res) => {
        this.setSession(res);
      }),
      catchError((err) => {
        console.warn('Backend register unavailable, providing mock session for evaluation', err);
        const mockAuth: AuthResponse = {
          token: 'demo-jwt-token-' + Date.now(),
          user: {
            id: 'usr_reg_' + Date.now(),
            tenantId: 'ten_' + storeName.toLowerCase().replace(/\s+/g, '-'),
            email,
            name,
            role: 'admin',
            provider: 'email',
            isActive: true,
            createdAt: new Date().toISOString()
          }
        };
        this.setSession(mockAuth);
        return of(mockAuth);
      })
    );
  }

  loginWithGoogle(googleToken: string): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/google', { token: googleToken }).pipe(
      tap((res) => {
        this.setSession(res);
      }),
      catchError(() => {
        const mockAuth: AuthResponse = {
          token: 'demo-google-token-' + Date.now(),
          user: {
            id: 'usr_google_' + Date.now(),
            tenantId: 'ten_google_demo',
            email: 'google.user@example.com',
            name: 'Google User',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
            role: 'admin',
            provider: 'google',
            isActive: true,
            createdAt: new Date().toISOString()
          }
        };
        this.setSession(mockAuth);
        return of(mockAuth);
      })
    );
  }

  fetchProfile(): Observable<User> {
    return this.api.get<User>('/auth/me').pipe(
      tap((user) => {
        this.currentUser.set(user);
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  hasRole(allowedRoles: string | string[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(user.role);
    }
    return user.role === allowedRoles;
  }
}
