import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappButtonComponent } from './whatsapp-button.component';

describe('WhatsappButtonComponent', () => {
  let fixture: ComponentFixture<WhatsappButtonComponent>;
  let component: WhatsappButtonComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [WhatsappButtonComponent] });
    fixture = TestBed.createComponent(WhatsappButtonComponent);
    component = fixture.componentInstance;
  });

  function getButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button');
  }

  it('usa os textos padrao "Chamar no WhatsApp" / "Abrindo WhatsApp..." quando label/loadingLabel nao sao informados', () => {
    fixture.detectChanges();
    expect(getButton().textContent).toContain('Chamar no WhatsApp');

    component.loading = true;
    fixture.detectChanges();
    expect(getButton().textContent).toContain('Abrindo WhatsApp...');
  });

  it('usa o label customizado quando informado (fluxo de compartilhar o proprio anuncio)', () => {
    component.label = 'Compartilhar no WhatsApp';
    fixture.detectChanges();

    expect(getButton().textContent).toContain('Compartilhar no WhatsApp');
    expect(getButton().textContent).not.toContain('Chamar no WhatsApp');
  });

  it('mostra o aviso de disabledMessage apenas quando desabilitado', () => {
    component.disabled = true;
    component.disabledMessage = 'Este produto ja foi vendido.';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.whatsapp-button-bar__notice')?.textContent).toContain(
      'Este produto ja foi vendido.'
    );
  });

  it('nao mostra aviso quando habilitado, mesmo com disabledMessage preenchido', () => {
    component.disabled = false;
    component.disabledMessage = 'Este produto ja foi vendido.';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.whatsapp-button-bar__notice')).toBeNull();
  });

  it('emite activate ao clicar no botao quando habilitado', () => {
    const spy = jasmine.createSpy('activate');
    component.activate.subscribe(spy);
    fixture.detectChanges();

    getButton().click();

    expect(spy).toHaveBeenCalled();
  });

  it('nao emite activate quando desabilitado', () => {
    const spy = jasmine.createSpy('activate');
    component.disabled = true;
    component.activate.subscribe(spy);
    fixture.detectChanges();

    component.onClick();

    expect(spy).not.toHaveBeenCalled();
  });

  it('nao emite activate quando loading', () => {
    const spy = jasmine.createSpy('activate');
    component.loading = true;
    component.activate.subscribe(spy);
    fixture.detectChanges();

    component.onClick();

    expect(spy).not.toHaveBeenCalled();
  });
});
