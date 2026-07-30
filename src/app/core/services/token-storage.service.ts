import { Injectable } from '@angular/core';

const TOKEN_KEY = 'vitrine_access_token';

/**
 * Centraliza o acesso ao localStorage para o JWT.
 * Isolado em service proprio para facilitar troca futura de estrategia de storage
 * (ex.: cookie httpOnly) sem tocar em AuthService/interceptor.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }
}
