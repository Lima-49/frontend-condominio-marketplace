import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse, AuthUser, LoginPayload, Me, RegisterPayload } from '../models/user.model';
import { TokenStorageService } from './token-storage.service';

/**
 * Sessao do usuario logado.
 *
 * Estrategia de auth para o MVP: JWT em localStorage (via TokenStorageService), anexado
 * pelo AuthInterceptor. `currentUser` e um signal hidratado a partir da resposta de
 * login/register, ou de GET /auth/me ao recarregar a pagina (ver `hydrateSession`).
 *
 * Nota de validacao: os formularios de Login/Cadastro validam no cliente (Reactive Forms),
 * mas o backend e sempre a fonte de verdade — nunca confiar apenas na validacao do frontend
 * (padrao tecnico do CLAUDE.md).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private readonly currentUserSignal = signal<AuthUser | Me | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null || this.tokenStorage.getToken() !== null);

  constructor(
    private readonly http: HttpClient,
    private readonly tokenStorage: TokenStorageService
  ) {}

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, payload)
      .pipe(tap((response) => this.storeSession(response)));
  }

  /**
   * Cadastro nao loga o usuario automaticamente: o fluxo aprovado manda o morador
   * de volta para a tela de Login apos criar a conta (ver RegisterComponent).
   */
  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, payload);
  }

  /** GET /auth/me — hidrata a sessao quando ha token salvo mas nenhum usuario em memoria (reload de pagina). */
  me(): Observable<Me> {
    return this.http.get<Me>(`${this.baseUrl}/me`).pipe(tap((me) => this.currentUserSignal.set(me)));
  }

  /** Chamado uma vez na inicializacao do app (ver AppComponent). Nao bloqueia o bootstrap. */
  hydrateSession(): void {
    if (this.tokenStorage.getToken() && !this.currentUserSignal()) {
      this.me().subscribe({
        error: () => this.logout()
      });
    }
  }

  logout(): void {
    this.tokenStorage.clearToken();
    this.currentUserSignal.set(null);
  }

  private storeSession(response: AuthResponse): void {
    this.tokenStorage.setToken(response.accessToken);
    this.currentUserSignal.set(response.user);
  }
}
