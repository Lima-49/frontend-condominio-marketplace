import { Component, Input } from '@angular/core';

import { ProductStatus } from '../../../core/models/product.model';

const STATUS_LABEL: Record<ProductStatus, string> = {
  available: 'Disponivel',
  reserved: 'Reservado',
  sold: 'Vendido'
};

/** Badge visual de status do produto, reutilizado no card e na tela de detalhe. */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss'
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: ProductStatus;

  get label(): string {
    return STATUS_LABEL[this.status];
  }
}
