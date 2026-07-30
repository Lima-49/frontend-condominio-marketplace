/**
 * Usuario autenticado. Nunca inclui passwordHash/whatsapp/block/apartment
 * (o backend nao retorna esses campos em nenhuma rota de auth, conforme API_SPEC.md).
 */
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  condominiumId: string;
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
