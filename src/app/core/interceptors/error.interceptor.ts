import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { ApiErrorBody } from '../models/api.model';
import { AuthService } from '../services/auth.service';

/**
 * Normaliza erros HTTP para o formato do API_SPEC.md (secao 1.2) e trata 401 de forma global:
 * limpa a sessao e redireciona para o login (token expirado/invalido), exceto quando o proprio
 * 401 veio de uma tentativa de login (nesse caso o formulario de login mostra o erro).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');

        if (error.status === 401 && !isAuthRequest) {
          authService.logout();
          router.navigate(['/login']);
        }

        const body: ApiErrorBody = error.error?.message
          ? error.error
          : {
              statusCode: error.status,
              error: error.statusText || 'Error',
              message: 'Nao foi possivel completar a solicitacao. Tente novamente.'
            };

        return throwError(() => body);
      }

      return throwError(() => error);
    })
  );
};
