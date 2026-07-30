import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { TokenStorageService } from '../services/token-storage.service';

/**
 * Anexa `Authorization: Bearer <token>` em toda requisicao, quando ha token salvo.
 * Rotas publicas do backend (`POST /auth/login`, `POST /auth/register`, `GET /condominiums`)
 * simplesmente ignoram o header extra, entao nao ha necessidade de lista de excecao aqui.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const token = tokenStorage.getToken();

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    })
  );
};
