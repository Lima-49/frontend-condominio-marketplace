/**
 * Papel do usuario. `resident` e o default de todo cadastro via `/auth/register`;
 * `platform_admin` e atribuido manualmente pelo time, direto no banco (nunca por
 * autoatendimento — ver docs/product/ADMIN_DASHBOARD.md secao 2).
 */
export type UserRole = 'resident' | 'platform_admin';

/**
 * Usuario autenticado. Nunca inclui passwordHash/whatsapp/block/apartment
 * (o backend nao retorna esses campos em nenhuma rota de auth, conforme API_SPEC.md).
 */
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  condominiumId: string;
  role: UserRole;
}

/** Resposta de POST /auth/login e POST /auth/register. */
export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

/** Resposta de GET /auth/me. */
export interface Me {
  id: string;
  fullName: string;
  email: string;
  condominiumId: string;
  condominiumName: string;
  role: UserRole;
}

/** Body de POST /auth/register. */
export interface RegisterPayload {
  fullName: string;
  whatsapp: string;
  condominiumId: string;
  block: string;
  apartment: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

/** Body de POST /auth/login. */
export interface LoginPayload {
  email: string;
  password: string;
}
