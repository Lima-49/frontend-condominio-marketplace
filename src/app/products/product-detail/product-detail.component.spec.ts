import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ProductDetailComponent } from './product-detail.component';
import { ProductDetail, WhatsappClickResponse } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';

describe('ProductDetailComponent', () => {
  let fixture: ComponentFixture<ProductDetailComponent>;
  let component: ProductDetailComponent;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  function buildProduct(overrides: Partial<ProductDetail> = {}): ProductDetail {
    return {
      id: 'p1',
      name: 'Bicicleta aro 29',
      description: 'Seminova, pouco uso.',
      priceCents: 45000,
      status: 'available',
      category: { id: 'cat1', name: 'Esporte' },
      images: [],
      seller: { firstName: 'Fulano' },
      createdAt: '2026-01-01T00:00:00.000Z',
      isOwner: false,
      ...overrides
    };
  }

  beforeEach(() => {
    productServiceSpy = jasmine.createSpyObj('ProductService', ['getById', 'whatsappClick']);

    TestBed.configureTestingModule({
      imports: [ProductDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ProductService, useValue: productServiceSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'p1' } } } }
      ]
    });

    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
  });

  function load(product: ProductDetail): void {
    productServiceSpy.getById.and.returnValue(of(product));
    fixture.detectChanges();
  }

  describe('dono do anuncio', () => {
    it('mostra o botao habilitado como "Compartilhar no WhatsApp" quando o produto esta disponivel', () => {
      load(buildProduct({ isOwner: true, status: 'available' }));

      expect(component.whatsappDisabled).toBe(false);
      expect(component.whatsappDisabledMessage).toBeNull();
      expect(component.whatsappLabel).toBe('Compartilhar no WhatsApp');
    });

    it('mantem o botao de compartilhar habilitado mesmo com o produto vendido', () => {
      load(buildProduct({ isOwner: true, status: 'sold' }));

      expect(component.whatsappDisabled).toBe(false);
      expect(component.whatsappDisabledMessage).toBeNull();
    });

    it('ao ativar, monta o link wa.me localmente com nome, preco e link do anuncio, sem chamar o backend', () => {
      load(buildProduct({ isOwner: true, id: 'p1', name: 'Bicicleta aro 29', priceCents: 45000 }));
      spyOn(window, 'open');

      component.onWhatsappActivate();

      expect(productServiceSpy.whatsappClick).not.toHaveBeenCalled();
      expect(window.open).toHaveBeenCalledTimes(1);

      const [url, target, features] = (window.open as jasmine.Spy).calls.mostRecent().args;
      expect(url).toContain('https://wa.me/?text=');
      expect(decodeURIComponent(url)).toContain('Bicicleta aro 29');
      expect(decodeURIComponent(url)).toContain('450,00');
      expect(decodeURIComponent(url)).toContain(`${window.location.origin}/produtos/p1`);
      expect(target).toBe('_blank');
      expect(features).toBe('noopener');
    });
  });

  describe('quem nao e dono', () => {
    it('bloqueia o botao com mensagem quando o produto esta vendido', () => {
      load(buildProduct({ isOwner: false, status: 'sold' }));

      expect(component.whatsappDisabled).toBe(true);
      expect(component.whatsappDisabledMessage).toBe('Este produto ja foi vendido.');
      expect(component.whatsappLabel).toBe('Chamar no WhatsApp');
    });

    it('habilita "Chamar no WhatsApp" quando disponivel e, ao ativar, chama o backend e abre a URL retornada', () => {
      load(buildProduct({ isOwner: false, status: 'available' }));
      spyOn(window, 'open');
      const response: WhatsappClickResponse = { url: 'https://wa.me/5511999999999' };
      productServiceSpy.whatsappClick.and.returnValue(of(response));

      expect(component.whatsappDisabled).toBe(false);

      component.onWhatsappActivate();

      expect(productServiceSpy.whatsappClick).toHaveBeenCalledWith('p1');
      expect(window.open).toHaveBeenCalledWith(response.url, '_blank', 'noopener');
    });
  });
});
