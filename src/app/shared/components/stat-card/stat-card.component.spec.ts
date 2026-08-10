import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatCardComponent } from './stat-card.component';

describe('StatCardComponent', () => {
  let fixture: ComponentFixture<StatCardComponent>;
  let component: StatCardComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [StatCardComponent] });
    fixture = TestBed.createComponent(StatCardComponent);
    component = fixture.componentInstance;
  });

  it('renderiza valor e label', () => {
    component.label = 'Media de anuncios por usuario';
    component.value = '3,4';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.stat-card__value').textContent).toContain('3,4');
    expect(fixture.nativeElement.querySelector('.stat-card__label').textContent).toContain('Media de anuncios por usuario');
  });

  it('mostra descricao apenas quando informada', () => {
    component.label = 'Media';
    component.value = '—';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.stat-card__description')).toBeNull();

    component.description = 'Ainda nao ha moradores cadastrados.';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.stat-card__description').textContent).toContain('Ainda nao ha moradores cadastrados.');
  });
});
