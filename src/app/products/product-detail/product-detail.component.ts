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

const WHATSAPP_SHARE_LABEL = 'Compartilhar no WhatsApp';
const WHATSAPP_CONTACT_LABEL = 'Chamar no WhatsApp';

/**
 * Tela de Detalhe (GET /products/:id). Para quem nao e dono, o botao de WhatsApp nunca monta
 * o link no frontend: so navega para a URL que o backend retorna em POST /products/:id/whatsapp-click
 * (unico endpoint que conhece o numero bruto do vendedor — API_SPEC.md secao 5). Para o dono do
 * anuncio, o mesmo botao vira "compartilhar" e monta um link wa.me localmente (sem chamar o backend),
 * ja que nao ha numero de vendedor envolvido nesse caso.
 */
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent, EmptyStateComponent, StatusBadgeComponent, WhatsappButtonComponent, PriceCentsPipe],
  providers: [PriceCentsPipe],
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
    private readonly productService: ProductService,
    private readonly priceCentsPipe: PriceCentsPipe
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
    return !this.product.isOwner && this.product.status === 'sold';
  }

  get whatsappDisabledMessage(): string | null {
    if (!this.product || this.product.isOwner) return null;
    if (this.product.status === 'sold') return 'Este produto ja foi vendido.';
    return null;
  }

  get whatsappLabel(): string {
    return this.product?.isOwner ? WHATSAPP_SHARE_LABEL : WHATSAPP_CONTACT_LABEL;
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

  onWhatsappActivate(): void {
    if (this.product?.isOwner) {
      this.shareProduct();
    } else {
      this.callWhatsapp();
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

  /** Compartilhar o proprio anuncio: nao passa pelo backend, so monta o link wa.me localmente. */
  private shareProduct(): void {
    if (!this.product) return;

    const productUrl = `${window.location.origin}/produtos/${this.product.id}`;
    const price = this.priceCentsPipe.transform(this.product.priceCents);
    const message = `Confira este anuncio no Vitrine do Condominio: ${this.product.name} - ${price}\n${productUrl}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  }
}
