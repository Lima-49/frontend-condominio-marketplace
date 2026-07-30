import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ApiErrorBody } from '../../core/models/api.model';
import { ProductDetail } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { WhatsappButtonComponent } from '../../shared/components/whatsapp-button/whatsapp-button.component';
import { PriceCentsPipe } from '../../shared/pipes/price-cents.pipe';

/**
 * Tela de Detalhe (GET /products/:id). O botao de WhatsApp nunca monta o link no frontend:
 * so navega para a URL que o backend retorna em POST /products/:id/whatsapp-click
 * (unico endpoint que conhece o numero bruto do vendedor — API_SPEC.md secao 5).
 */
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent, EmptyStateComponent, StatusBadgeComponent, WhatsappButtonComponent, PriceCentsPipe],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  product: ProductDetail | null = null;
  loading = true;
  notFound = false;

  whatsappLoading = false;
  whatsappError: string | null = null;

  imageModalOpen = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly productService: ProductService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.productService.getById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
      },
      error: () => {
        // 404 (outro condominio/excluido/inexistente) e tratado como "nao encontrado" na UI,
        // sem distinguir motivo (mesma logica de seguranca do backend: nunca confirmar existencia).
        this.notFound = true;
        this.loading = false;
      }
    });
  }

  get coverImageUrl(): string | null {
    return this.product?.images?.[0]?.url ?? null;
  }

  get whatsappDisabled(): boolean {
    if (!this.product) return true;
    return this.product.status === 'sold' || this.product.isOwner;
  }

  get whatsappDisabledMessage(): string | null {
    if (!this.product) return null;
    if (this.product.status === 'sold') return 'Este produto ja foi vendido.';
    if (this.product.isOwner) return 'Este e o seu proprio anuncio.';
    return null;
  }

  openImageModal(): void {
    if (this.coverImageUrl) {
      this.imageModalOpen = true;
    }
  }

  closeImageModal(): void {
    this.imageModalOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.imageModalOpen) {
      this.closeImageModal();
    }
  }

  callWhatsapp(): void {
    if (!this.product) return;

    this.whatsappLoading = true;
    this.whatsappError = null;

    this.productService.whatsappClick(this.product.id).subscribe({
      next: (response) => {
        this.whatsappLoading = false;
        window.open(response.url, '_blank', 'noopener');
      },
      error: (error: ApiErrorBody) => {
        this.whatsappLoading = false;
        this.whatsappError = error.message || 'Nao foi possivel abrir o WhatsApp. Tente novamente.';
      }
    });
  }
}
