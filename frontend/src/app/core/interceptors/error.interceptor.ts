import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Clear auth and redirect to login
        authService.logout();
        router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      } else if (error.status === 403) {
        console.error('Acceso denegado (403): no tienes permisos para realizar esta acción.');
      } else if (error.status >= 500) {
        console.error('Error interno del servidor (500). Intenta de nuevo más tarde.');
      }

      return throwError(() => error);
    })
  );
};
