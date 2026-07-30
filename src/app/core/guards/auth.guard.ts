import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { TokenStorageService } from '../services/token-storage.service';

/**
 * Protege rotas privadas (Vitrine, Detalhe, Criar/editar, Meus anuncios).
 *
 * Checagem sincrona por presenca de token (suficiente para o MVP: se o token estiver
 * expirado/invalido, a primeira chamada protegida recebe 401 e o ErrorInterceptor
 * redireciona para o login). Isso evita esperar uma chamada de rede (GET /auth/me)
 * so para decidir se a rota pode ser ativada.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  if (tokenStorage.getToken()) {
    return true;
  }

  return router.createUrlTree(['/login'], { queryParams: { redirectTo: state.url } });
};
