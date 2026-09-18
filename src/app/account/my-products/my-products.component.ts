import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
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
  rowError: string | null = null;

  /** Produto pendente de confirmacao no modal de exclusao (secao 4 do design doc). */
  productPendingDelete: ProductListItem | null = null;
  deleting = false;
  deleteError: string | null = null;
  private deleteTriggerEl: HTMLElement | null = null;

  @ViewChild('cancelDeleteBtn') private cancelDeleteBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('confirmDeleteBtn') private confirmDeleteBtn?: ElementRef<HTMLButtonElement>;

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

  askDelete(product: ProductListItem, event: Event): void {
    this.deleteTriggerEl = event.currentTarget as HTMLElement;
    this.productPendingDelete = product;
    this.deleteError = null;
    // Foco inicial no botao Cancelar (secao 4/acessibilidade do design doc); precisa de setTimeout
    // porque o botao so existe no DOM apos o Angular renderizar o `@if` deste ciclo.
    setTimeout(() => this.cancelDeleteBtn?.nativeElement.focus());
  }

  cancelDelete(): void {
    if (this.deleting) return;
    this.productPendingDelete = null;
    this.deleteError = null;
    this.restoreFocus();
  }

  confirmDelete(): void {
    if (!this.productPendingDelete || this.deleting) return;

    const product = this.productPendingDelete;
    this.deleting = true;
    this.deleteError = null;
    this.productService.delete(product.id).subscribe({
      next: () => {
        this.deleting = false;
        this.products = this.products.filter((p) => p.id !== product.id);
        this.total = Math.max(0, this.total - 1);
        this.productPendingDelete = null;
        this.restoreFocus();
      },
      error: (error: ApiErrorBody) => {
        this.deleting = false;
        this.deleteError = error.message || 'Nao foi possivel excluir o anuncio.';
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.productPendingDelete) {
      this.cancelDelete();
    }
  }

  /** Focus trap do modal (secao 4/acessibilidade do design doc): Tab/Shift+Tab ciclam entre Cancelar e Excluir. */
  onModalTab(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key !== 'Tab') return;

    const first = this.cancelDeleteBtn?.nativeElement;
    const last = this.confirmDeleteBtn?.nativeElement;
    if (!first || !last) return;

    const active = document.activeElement;
    if (keyboardEvent.shiftKey && active === first) {
      keyboardEvent.preventDefault();
      last.focus();
    } else if (!keyboardEvent.shiftKey && active === last) {
      keyboardEvent.preventDefault();
      first.focus();
    }
  }

  private restoreFocus(): void {
    this.deleteTriggerEl?.focus();
    this.deleteTriggerEl = null;
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
