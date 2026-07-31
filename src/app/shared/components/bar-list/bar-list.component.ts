import { Component, Input } from '@angular/core';

export interface BarListItem {
  label: string;
  value: number;
}

/**
 * Lista de barras horizontais (Painel Admin, H2/H3: usuarios por condominio, top categorias).
 * HTML semantico real (uma lista com o texto do dado), nao canvas/SVG — a "visualizacao" e a
 * propria lista de dados acessivel (ADMIN_DASHBOARD_DESIGN.md secao 10); a barra e so uma
 * <div> puramente decorativa (`aria-hidden`). Ordenacao (decrescente) e responsabilidade de
 * quem consome o componente, nao dele.
 */
@Component({
  selector: 'app-bar-list',
  standalone: true,
  templateUrl: './bar-list.component.html',
  styleUrl: './bar-list.component.scss'
})
export class BarListComponent {
  @Input({ required: true }) items: BarListItem[] = [];
  /** Usado como aria-label da lista, para o leitor de tela identificar do que se trata o ranking. */
  @Input() title = '';

  get maxValue(): number {
    return Math.max(1, ...this.items.map((item) => item.value));
  }

  /** Zerado ganha uma largura minima visivel (nunca so espaco em branco, para nao parecer bug). */
  widthFor(value: number): string {
    if (value <= 0) {
      return '4px';
    }
    return `${(value / this.maxValue) * 100}%`;
  }
}
