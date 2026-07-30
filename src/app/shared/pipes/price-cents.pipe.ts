import { Pipe, PipeTransform } from '@angular/core';

/**
 * `priceCents` trafega sempre como inteiro (centavos) no contrato de API (API_SPEC.md 1.4).
 * Este pipe e o unico lugar que converte para exibicao em R$.
 */
@Pipe({ name: 'priceCents', standalone: true })
export class PriceCentsPipe implements PipeTransform {
  private readonly formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  transform(cents: number | null | undefined): string {
    if (cents === null || cents === undefined) {
      return '-';
    }
    return this.formatter.format(cents / 100);
  }
}
