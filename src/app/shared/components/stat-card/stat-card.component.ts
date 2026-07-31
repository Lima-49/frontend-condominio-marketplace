import { Component, Input } from '@angular/core';

/**
 * Numero-resumo (Painel Admin, ex.: media de anuncios por usuario). Texto simples, sem
 * dependencia de cor para comunicar o valor (ADMIN_DASHBOARD_DESIGN.md secao 10).
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss'
})
export class StatCardComponent {
  @Input({ required: true }) label!: string;
  /** Valor ja formatado como texto (ex.: "3,4", "12", "—" para denominador zero), decidido por quem usa o componente. */
  @Input({ required: true }) value!: string;
  @Input() description = '';
}
