import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Protege `/admin` (Painel Administrativo da Plataforma). Camada 1 de duas
 * (ADMIN_DASHBOARD_DESIGN.md secao 2) — a garantia real de seguranca e o `403` do backend
 * quando `role != platform_admin`; este guard so evita a experiencia ruim de mostrar a tela
 * pra depois falhar.
 *
 * - `role === 'platform_admin'` -> libera a navegacao.
 * - `role === 'resident'` (ja conhecido, caso comum, pois `role` vem no login) -> redireciona
 *   para `/produtos` sem renderizar nada de `/admin`.
 * - `role` ainda desconhecido (reload direto em `/admin`, `GET /auth/me` em voo) -> libera de
 *   forma otimista; quem fecha o buraco nesse caso e a Camada 2 (AdminDashboardComponent),
 *   que trata o `403` real assim que a primeira chamada de metrica responder.
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const role = authService.currentUser()?.role;

  if (role === 'resident') {
    return router.createUrlTree(['/produtos']);
  }

  return true;
};
