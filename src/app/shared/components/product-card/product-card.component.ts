import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProductListItem } from '../../../core/models/product.model';
import { PriceCentsPipe } from '../../pipes/price-cents.pipe';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

/** Card de produto usado na Vitrine e em Meus Anuncios (grid). */
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent, PriceCentsPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductListItem;
}
