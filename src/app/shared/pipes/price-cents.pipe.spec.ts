import { PriceCentsPipe } from './price-cents.pipe';

describe('PriceCentsPipe', () => {
  const pipe = new PriceCentsPipe();

  it('formata centavos como moeda BRL', () => {
    expect(pipe.transform(45000)).toContain('450,00');
  });

  it('lida com zero', () => {
    expect(pipe.transform(0)).toContain('0,00');
  });

  it('retorna traco para valor nulo/indefinido', () => {
    expect(pipe.transform(null)).toBe('-');
    expect(pipe.transform(undefined)).toBe('-');
  });
});
