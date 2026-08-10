import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HeaderComponent } from './header.component';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });

    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(HeaderComponent);
  });

  afterEach(() => httpMock.verify());

  function loginAs(role: UserRole): void {
    authService.login({ email: 'user@teste.com', password: 'senha12345' }).subscribe();
    const req = httpMock.expectOne((request) => request.url.endsWith('/auth/login'));
    req.flush({
      accessToken: 'fake-jwt',
      user: { id: 'u1', fullName: 'Fulano', email: 'user@teste.com', condominiumId: 'c1', role }
    });
  }

  it('nao mostra o link "Painel Admin" para um morador comum (resident)', () => {
    loginAs('resident');
    fixture.detectChanges();

    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('a'));
    expect(links.some((link) => link.textContent?.includes('Painel Admin'))).toBe(false);
    expect(fixture.nativeElement.querySelector('.app-header__admin-icon')).toBeNull();
  });

  it('mostra o link "Painel Admin" (nav) e o icone compacto (mobile) para platform_admin', () => {
    loginAs('platform_admin');
    fixture.detectChanges();

    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('a'));
    expect(links.some((link) => link.textContent?.includes('Painel Admin'))).toBe(true);
    expect(fixture.nativeElement.querySelector('.app-header__admin-icon')).not.toBeNull();
  });
});
