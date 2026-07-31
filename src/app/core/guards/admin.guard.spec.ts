import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';

import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

describe('adminGuard', () => {
  let authService: AuthService;
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function runGuard() {
    return TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));
  }

  function loginAs(role: UserRole): void {
    authService.login({ email: 'admin@teste.com', password: 'senha12345' }).subscribe();
    const req = httpMock.expectOne((request) => request.url.endsWith('/auth/login'));
    req.flush({
      accessToken: 'fake-jwt',
      user: { id: 'u1', fullName: 'Time Vitrine', email: 'admin@teste.com', condominiumId: 'c1', role }
    });
  }

  it('libera acesso quando o usuario e platform_admin', () => {
    loginAs('platform_admin');
    expect(runGuard()).toBe(true);
  });

  it('redireciona para /produtos quando o usuario e resident', () => {
    loginAs('resident');
    const result = runGuard();
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/produtos');
  });

  it('libera acesso de forma otimista quando o role ainda nao e conhecido (ex.: reload em andamento)', () => {
    expect(runGuard()).toBe(true);
  });
});
