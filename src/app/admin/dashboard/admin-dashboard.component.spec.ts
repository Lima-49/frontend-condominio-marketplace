import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { AdminDashboardComponent } from './admin-dashboard.component';
import { ApiErrorBody } from '../../core/models/api.model';
import { CategoryProductCount, CondominiumUserCount, ProductsPerUserResponse } from '../../core/models/admin.model';
import { Category } from '../../core/models/category.model';
import { AdminService } from '../../core/services/admin.service';

describe('AdminDashboardComponent', () => {
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let component: AdminDashboardComponent;
  let adminServiceSpy: jasmine.SpyObj<AdminService>;

  const condominiums: CondominiumUserCount[] = [{ condominiumId: 'c1', condominiumName: 'Condominio A', userCount: 5 }];
  const categories: CategoryProductCount[] = [{ categoryId: 'cat1', categoryName: 'Livros', productCount: 3 }];
  const productsPerUser: ProductsPerUserResponse = {
    average: 1.5,
    topUsers: [{ userId: 'u1', fullName: 'Fulano de Tal', condominiumName: 'Condominio A', productCount: 3 }]
  };

  beforeEach(() => {
    adminServiceSpy = jasmine.createSpyObj('AdminService', [
      'usersByCondominium',
      'topCategories',
      'productsPerUser',
      'createCategory'
    ]);

    TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [provideRouter([]), { provide: AdminService, useValue: adminServiceSpy }]
    });

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
  });

  function succeedAllMetrics(): void {
    adminServiceSpy.usersByCondominium.and.returnValue(of(condominiums));
    adminServiceSpy.topCategories.and.returnValue(of(categories));
    adminServiceSpy.productsPerUser.and.returnValue(of(productsPerUser));
  }

  it('mostra o spinner de carregamento enquanto as 3 chamadas de metricas nao respondem todas', () => {
    const pending = new Subject<CondominiumUserCount[]>();
    adminServiceSpy.usersByCondominium.and.returnValue(pending.asObservable());
    adminServiceSpy.topCategories.and.returnValue(of(categories));
    adminServiceSpy.productsPerUser.and.returnValue(of(productsPerUser));

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Carregando painel administrativo...');
    expect(component.pageState).toBe('loading');
  });

  it('renderiza as 4 secoes com os dados das 3 metricas quando tudo carrega com sucesso', () => {
    succeedAllMetrics();
    fixture.detectChanges();

    expect(component.pageState).toBe('success');
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Condominio A');
    expect(text).toContain('Livros');
    expect(text).toContain('Fulano de Tal');
    expect(text).toContain('Cadastrar nova categoria');
  });

  it('mostra estado de erro (nao 403) com opcao de tentar novamente, sem exibir dados parciais', () => {
    adminServiceSpy.usersByCondominium.and.returnValue(of(condominiums));
    adminServiceSpy.topCategories.and.returnValue(
      throwError((): ApiErrorBody => ({ statusCode: 500, error: 'Internal Server Error', message: 'Erro interno' }))
    );
    adminServiceSpy.productsPerUser.and.returnValue(of(productsPerUser));

    fixture.detectChanges();

    expect(component.pageState).toBe('error');
    expect(fixture.nativeElement.textContent).toContain('Nao foi possivel carregar o painel administrativo.');
    expect(fixture.nativeElement.textContent).not.toContain('Condominio A');
  });

  it('mostra acesso negado quando qualquer metrica responde 403, mesmo que as outras tenham vindo 200', () => {
    adminServiceSpy.usersByCondominium.and.returnValue(of(condominiums));
    adminServiceSpy.topCategories.and.returnValue(
      throwError((): ApiErrorBody => ({ statusCode: 403, error: 'Forbidden', message: 'Acesso negado' }))
    );
    adminServiceSpy.productsPerUser.and.returnValue(of(productsPerUser));

    fixture.detectChanges();

    expect(component.pageState).toBe('access-denied');
    expect(fixture.nativeElement.textContent).toContain('Acesso restrito');
    expect(fixture.nativeElement.textContent).not.toContain('Condominio A');
    expect(fixture.nativeElement.textContent).not.toContain('Fulano de Tal');
  });

  describe('formulario de nova categoria (H5)', () => {
    beforeEach(() => {
      succeedAllMetrics();
      fixture.detectChanges();
    });

    it('nao submete com nome invalido (menos de 2 caracteres apos trim)', () => {
      component.categoryForm.setValue({ name: ' a ' });
      component.submitCategory();

      expect(adminServiceSpy.createCategory).not.toHaveBeenCalled();
      expect(component.categoryForm.controls.name.touched).toBe(true);
    });

    it('cadastra a categoria com sucesso, limpa o formulario e atualiza o ranking local', () => {
      const created: Category = { id: 'cat2', name: 'Eletronicos', slug: 'eletronicos' };
      adminServiceSpy.createCategory.and.returnValue(of(created));

      component.categoryForm.setValue({ name: '  Eletronicos  ' });
      component.submitCategory();

      expect(adminServiceSpy.createCategory).toHaveBeenCalledWith({ name: 'Eletronicos' });
      expect(component.categorySuccessMessage).toContain('Eletronicos');
      expect(component.categoryForm.controls.name.value).toBeFalsy();
      expect(component.categories.some((category) => category.categoryId === 'cat2' && category.productCount === 0)).toBe(true);
    });

    it('mostra o erro de nome duplicado junto ao campo, sem limpar o valor digitado', () => {
      const error: ApiErrorBody = {
        statusCode: 400,
        error: 'Bad Request',
        message: 'Nome invalido',
        details: [{ field: 'name', message: 'Ja existe uma categoria com esse nome.' }]
      };
      adminServiceSpy.createCategory.and.returnValue(throwError(() => error));

      component.categoryForm.setValue({ name: 'Livros' });
      component.submitCategory();

      expect(component.categoryFieldError).toBe('Ja existe uma categoria com esse nome.');
      expect(component.categoryErrorMessage).toBeNull();
      expect(component.categoryForm.controls.name.value).toBe('Livros');
    });

    it('mostra o resumo de erro no topo quando o backend nao retorna details', () => {
      const error: ApiErrorBody = { statusCode: 500, error: 'Internal Server Error', message: 'Falha inesperada' };
      adminServiceSpy.createCategory.and.returnValue(throwError(() => error));

      component.categoryForm.setValue({ name: 'Livros' });
      component.submitCategory();

      expect(component.categoryErrorMessage).toBe('Falha inesperada');
      expect(component.categoryFieldError).toBeNull();
    });
  });
});
