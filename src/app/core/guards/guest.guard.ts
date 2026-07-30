import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { TokenStorageService } from '../services/token-storage.service';

/**
 * Usado nas rotas de Login/Cadastro: se ja existe um token salvo, manda direto para a
 * Vitrine em vez de mostrar o formulario de novo. Complementa (nao substitui) o authGuard.
 */
export const guestGuard: CanActivateFn = () => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  if (tokenStorage.getToken()) {
    return router.createUrlTree(['/produtos']);
  }

  return true;
};
