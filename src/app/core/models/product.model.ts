/** Status possiveis de um anuncio. `inactive` existe no banco mas nao e setavel pelo usuario (API_SPEC.md). */
export type ProductStatus = 'available' | 'reserved' | 'sold';

export interface ProductCategoryRef {
  id: string;
  name: string;
}

/** Item de listagem: GET /products e GET /products/mine. Nunca inclui description completa/vendedor/whatsapp. */
export interface ProductListItem {
  id: string;
  name: string;
  priceCents: number;
  status: ProductStatus;
  category: ProductCategoryRef;
  coverImageUrl: string | null;
  createdAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  position: number;
}

/** GET /products/:id, POST /products, PATCH /products/:id, PATCH /products/:id/status. */
export interface ProductDetail {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  status: ProductStatus;
  category: ProductCategoryRef;
  images: ProductImage[];
  /** Apenas primeiro nome do vendedor (nunca whatsapp/email/block/apartment/id do vendedor). */
  seller: { firstName: string };
  createdAt: string;
  /** Calculado no backend: permite ao frontend decidir se mostra acoes de dono sem comparar ids. */
  isOwner: boolean;
}

export interface ProductListQuery {
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
  sort?: 'recent';
  page?: number;
  limit?: number;
}

export interface MyProductsQuery {
  page?: number;
  limit?: number;
}

/** Payload de criacao/edicao usado internamente pelo form; convertido para FormData no service. */
export interface ProductFormValue {
  name: string;
  description: string;
  categoryId: string;
  priceCents: number;
  photos: File[];
}

export interface WhatsappClickResponse {
  url: string;
}
