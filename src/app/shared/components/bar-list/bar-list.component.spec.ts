import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarListComponent } from './bar-list.component';

describe('BarListComponent', () => {
  let fixture: ComponentFixture<BarListComponent>;
  let component: BarListComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [BarListComponent] });
    fixture = TestBed.createComponent(BarListComponent);
    component = fixture.componentInstance;
  });

  it('renderiza uma linha por item, com o numero sempre visivel ao lado da barra', () => {
    component.items = [
      { label: 'Condominio A', value: 8 },
      { label: 'Condominio B', value: 2 }
    ];
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.bar-list__row');
    expect(rows.length).toBe(2);
    expect(rows[0].querySelector('.bar-list__value').textContent).toContain('8');
    expect(rows[1].querySelector('.bar-list__value').textContent).toContain('2');
  });

  it('da 100% de largura ao unico item quando ha so 1 (ex.: 1 condominio no piloto)', () => {
    component.items = [{ label: 'Condominio Unico', value: 5 }];
    fixture.detectChanges();

    const bar = fixture.nativeElement.querySelector('.bar-list__bar');
    expect(bar.style.width).toBe('100%');
  });

  it('mostra item zerado com largura minima visivel e o numero 0 explicito (nunca some da lista)', () => {
    component.items = [
      { label: 'Categoria com uso', value: 4 },
      { label: 'Categoria sem uso', value: 0 }
    ];
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.bar-list__row');
    expect(rows.length).toBe(2);
    expect(rows[1].classList).toContain('bar-list__row--zero');
    expect(rows[1].querySelector('.bar-list__bar').style.width).toBe('4px');
    expect(rows[1].querySelector('.bar-list__value').textContent).toContain('0');
  });

  it('usa o title como aria-label da lista quando informado', () => {
    component.items = [];
    component.title = 'Usuarios por condominio';
    fixture.detectChanges();

    const list = fixture.nativeElement.querySelector('ul');
    expect(list.getAttribute('aria-label')).toBe('Usuarios por condominio');
  });
});
