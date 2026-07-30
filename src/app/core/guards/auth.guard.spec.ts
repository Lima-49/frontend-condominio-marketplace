import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';

import { authGuard } from './auth.guard';
import { TokenStorageService } from '../services/token-storage.service';

describe('authGuard', () => {
  let tokenStorage: TokenStorageService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TokenStorageService, provideRouter([])]
    });
    tokenStorage = TestBed.inject(TokenStorageService);
    router = TestBed.inject(Router);
    tokenStorage.clearToken();
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/produtos' } as never)
    );
  }

  it('permite acesso quando ha token salvo', () => {
    tokenStorage.setToken('fake-jwt');
    expect(runGuard()).toBe(true);
  });

  it('redireciona para /login preservando a rota de origem quando nao ha token', () => {
    const result = runGuard();
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toContain('/login');
    expect(router.serializeUrl(result as UrlTree)).toContain('redirectTo');
  });
});
