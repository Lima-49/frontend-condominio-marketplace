import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { MyProductsComponent } from './my-products.component';
import { ApiErrorBody } from '../../core/models/api.model';
import { ProductDetail, ProductListItem, ProductStatus } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';

describe('MyProductsComponent', () => {
  let fixture: ComponentFixture<MyProductsComponent>;
  let component: MyProductsComponent;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  function buildProduct(overrides: Partial<ProductListItem> = {}): ProductListItem {
    return {
      id: 'p1',
      name: 'Bicicleta aro 29',
      priceCents: 45000,
      status: 'available',
      category: { id: 'cat1', name: 'Esporte' },
      coverImageUrl: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      ...overrides
    };
  }

  function buildDetail(status: ProductStatus): ProductDetail {
    return {
      id: 'p1',
      name: 'Bicicleta aro 29',
      description: '',
      priceCents: 45000,
      status,
      category: { id: 'cat1', name: 'Esporte' },
      images: [],
      seller: { firstName: 'Fulano' },
      createdAt: '2026-01-01T00:00:00.000Z',
      isOwner: true
    };
  }

  beforeEach(() => {
    productServiceSpy = jasmine.createSpyObj('ProductService', ['mine', 'updateStatus', 'delete']);
    productServiceSpy.mine.and.returnValue(of({ data: [buildProduct()], meta: { page: 1, limit: 20, total: 1 } }));

    TestBed.configureTestingModule({
      imports: [MyProductsComponent],
      providers: [provideRouter([]), { provide: ProductService, useValue: productServiceSpy }]
    });

    fixture = TestBed.createComponent(MyProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('marca o produto como vendido ao trocar o status no select', () => {
    const product = component.products[0];
    productServiceSpy.updateStatus.and.returnValue(of(buildDetail('sold')));

    component.onStatusChange(product, 'sold');

    expect(productServiceSpy.updateStatus).toHaveBeenCalledWith('p1', 'sold');
    expect(product.status).toBe('sold');
  });

  it('reverte um produto vendido para disponivel', () => {
    const product = component.products[0];
    product.status = 'sold';
    productServiceSpy.updateStatus.and.returnValue(of(buildDetail('available')));

    component.onStatusChange(product, 'available');

    expect(productServiceSpy.updateStatus).toHaveBeenCalledWith('p1', 'available');
    expect(product.status).toBe('available');
  });

  it('abre o modal de exclusao ao clicar em Excluir, com o nome do produto', () => {
    const button = document.createElement('button');
    component.askDelete(component.products[0], { currentTarget: button } as unknown as Event);
    fixture.detectChanges();

    expect(component.productPendingDelete?.name).toBe('Bicicleta aro 29');

    const box = fixture.nativeElement.querySelector('.delete-modal__box');
    expect(box.textContent).toContain('Bicicleta aro 29');
  });

  it('cancela a exclusao pelo botao Cancelar sem chamar a API', () => {
    const button = document.createElement('button');
    component.askDelete(component.products[0], { currentTarget: button } as unknown as Event);
    fixture.detectChanges();

    component.cancelDelete();
    fixture.detectChanges();

    expect(component.productPendingDelete).toBeNull();
    expect(productServiceSpy.delete).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.delete-modal')).toBeNull();
  });

  it('cancela a exclusao ao clicar no backdrop do modal', () => {
    const button = document.createElement('button');
    component.askDelete(component.products[0], { currentTarget: button } as unknown as Event);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.delete-modal');
    backdrop.click();
    fixture.detectChanges();

    expect(component.productPendingDelete).toBeNull();
    expect(productServiceSpy.delete).not.toHaveBeenCalled();
  });

  it('cancela a exclusao ao pressionar Esc', () => {
    const button = document.createElement('button');
    component.askDelete(component.products[0], { currentTarget: button } as unknown as Event);
    fixture.detectChanges();

    component.onEscapeKey();
    fixture.detectChanges();

    expect(component.productPendingDelete).toBeNull();
    expect(productServiceSpy.delete).not.toHaveBeenCalled();
  });

  it('confirma a exclusao removendo o item da lista', () => {
    const button = document.createElement('button');
    const product = component.products[0];
    component.askDelete(product, { currentTarget: button } as unknown as Event);
    productServiceSpy.delete.and.returnValue(of(undefined));

    component.confirmDelete();
    fixture.detectChanges();

    expect(productServiceSpy.delete).toHaveBeenCalledWith('p1');
    expect(component.products.find((p) => p.id === 'p1')).toBeUndefined();
    expect(component.productPendingDelete).toBeNull();
    expect(fixture.nativeElement.querySelector('.delete-modal')).toBeNull();
  });

  it('focus trap: Tab no botao Excluir (ultimo) volta o foco para Cancelar (primeiro)', () => {
    const button = document.createElement('button');
    component.askDelete(component.products[0], { currentTarget: button } as unknown as Event);
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('.delete-modal');
    const [cancelBtn, confirmBtn] = fixture.nativeElement.querySelectorAll('.delete-modal__actions button');
    confirmBtn.focus();

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    modal.dispatchEvent(event);

    expect(event.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(cancelBtn);
  });

  it('focus trap: Shift+Tab no botao Cancelar (primeiro) vai para Excluir (ultimo)', () => {
    const button = document.createElement('button');
    component.askDelete(component.products[0], { currentTarget: button } as unknown as Event);
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('.delete-modal');
    const [cancelBtn, confirmBtn] = fixture.nativeElement.querySelectorAll('.delete-modal__actions button');
    cancelBtn.focus();

    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
    modal.dispatchEvent(event);

    expect(event.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(confirmBtn);
  });

  it('mantem o modal aberto com mensagem de erro quando a exclusao falha', () => {
    const button = document.createElement('button');
    const product = component.products[0];
    component.askDelete(product, { currentTarget: button } as unknown as Event);
    const apiError: ApiErrorBody = { statusCode: 404, error: 'Not Found', message: 'Anuncio nao encontrado.' };
    productServiceSpy.delete.and.returnValue(throwError(() => apiError));

    component.confirmDelete();
    fixture.detectChanges();

    expect(component.productPendingDelete).not.toBeNull();
    expect(component.products.length).toBe(1);
    expect(component.deleteError).toBe('Anuncio nao encontrado.');

    const modal = fixture.nativeElement.querySelector('.delete-modal');
    expect(modal.textContent).toContain('Anuncio nao encontrado.');
  });
});
