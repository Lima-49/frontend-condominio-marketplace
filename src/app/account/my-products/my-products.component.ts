import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ApiErrorBody } from '../../core/models/api.model';
import { ProductListItem, ProductStatus } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { PriceCentsPipe } from '../../shared/pipes/price-cents.pipe';

const PAGE_SIZE = 20;

/**
 * Meus anuncios (GET /products/mine): qualquer status, acoes editar/marcar status/excluir.
 * Edicao permitida mesmo com produto vendido (DECISIONS_LOG.md #3); transicoes de status
 * livres entre available/reserved/sold, sem ordem obrigatoria (DECISIONS_LOG.md #4).
 */
@Component({
  selector: 'app-my-products',
  standalone: true,
  imports: [RouterLink, FormsModule, LoadingSpinnerComponent, EmptyStateComponent, StatusBadgeComponent, PriceCentsPipe],
  templateUrl: './my-products.component.html',
  styleUrl: './my-products.component.scss'
})
export class MyProductsComponent implements OnInit {
  readonly statusOptions: { value: ProductStatus; label: string }[] = [
    { value: 'available', label: 'Disponivel' },
    { value: 'reserved', label: 'Reservado' },
    { value: 'sold', label: 'Vendido' }
  ];

  products: ProductListItem[] = [];
  page = 1;
  total = 0;

  loading = true;
  loadingMore = false;
  errorMessage: string | null = null;

  updatingStatusId: string | null = null;
  deletingId: string | null = null;
  confirmingDeleteId: string | null = null;
  rowError: string | null = null;

  constructor(private readonly productService: ProductService) {}

  ngOnInit(): void {
    this.fetch();
  }

  get hasMore(): boolean {
    return this.products.length < this.total;
  }

  loadMore(): void {
    if (this.loadingMore || !this.hasMore) return;
    this.loadingMore = true;
    this.page += 1;
    this.fetch(true);
  }

  onStatusChange(product: ProductListItem, status: ProductStatus): void {
    if (status === product.status) return;

    this.rowError = null;
    this.updatingStatusId = product.id;
    this.productService.updateStatus(product.id, status).subscribe({
      next: (updated) => {
        this.updatingStatusId = null;
        product.status = updated.status;
      },
      error: (error: ApiErrorBody) => {
        this.updatingStatusId = null;
        this.rowError = error.message || 'Nao foi possivel atualizar o status.';
      }
    });
  }

  askDelete(productId: string): void {
    this.confirmingDeleteId = productId;
  }

  cancelDelete(): void {
    this.confirmingDeleteId = null;
  }

  confirmDelete(productId: string): void {
    this.rowError = null;
    this.deletingId = productId;
    this.productService.delete(productId).subscribe({
      next: () => {
        this.deletingId = null;
        this.confirmingDeleteId = null;
        this.products = this.products.filter((product) => product.id !== productId);
        this.total = Math.max(0, this.total - 1);
      },
      error: (error: ApiErrorBody) => {
        this.deletingId = null;
        this.rowError = error.message || 'Nao foi possivel excluir o anuncio.';
      }
    });
  }

  private fetch(append = false): void {
    if (!append) {
      this.page = 1;
      this.loading = true;
    }
    this.errorMessage = null;

    this.productService
      .mine({ page: this.page, limit: PAGE_SIZE })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingMore = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.products = append ? [...this.products, ...response.data] : response.data;
          this.total = response.meta.total;
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel carregar seus anuncios. Tente novamente.';
        }
      });
  }
}
