import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models/api.model';
import {
  MyProductsQuery,
  ProductDetail,
  ProductFormValue,
  ProductListItem,
  ProductListQuery,
  ProductStatus,
  WhatsappClickResponse
} from '../models/product.model';

/**
 * Integra com o modulo `products` do API_SPEC.md.
 *
 * Importante: `condominiumId`/`sellerId` NUNCA sao enviados pelo frontend em nenhum payload
 * (nem body, nem query) — o backend sempre deriva esses valores de `req.user` (token JWT).
 * Isso e reforcado aqui simplesmente por nunca existir um campo desses nos payloads abaixo.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly baseUrl = `${environment.apiUrl}/products`;

  constructor(private readonly http: HttpClient) {}

  list(query: ProductListQuery = {}): Observable<PaginatedResponse<ProductListItem>> {
    let params = new HttpParams();
    if (query.search) params = params.set('search', query.search);
    if (query.categoryId) params = params.set('categoryId', query.categoryId);
    if (query.status) params = params.set('status', query.status);
    if (query.sort) params = params.set('sort', query.sort);
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);

    return this.http.get<PaginatedResponse<ProductListItem>>(this.baseUrl, { params });
  }

  mine(query: MyProductsQuery = {}): Observable<PaginatedResponse<ProductListItem>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);

    return this.http.get<PaginatedResponse<ProductListItem>>(`${this.baseUrl}/mine`, { params });
  }

  getById(id: string): Observable<ProductDetail> {
    return this.http.get<ProductDetail>(`${this.baseUrl}/${id}`);
  }

  create(value: ProductFormValue): Observable<ProductDetail> {
    return this.http.post<ProductDetail>(this.baseUrl, this.toFormData(value));
  }

  /** Todos os campos de `value` sao opcionais na edicao: so envia o que foi preenchido/alterado. */
  update(id: string, value: Partial<ProductFormValue>): Observable<ProductDetail> {
    return this.http.patch<ProductDetail>(`${this.baseUrl}/${id}`, this.toFormData(value));
  }

  updateStatus(id: string, status: ProductStatus): Observable<ProductDetail> {
    return this.http.patch<ProductDetail>(`${this.baseUrl}/${id}/status`, { status });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** POST /products/:id/whatsapp-click — unico endpoint que conhece o numero bruto do vendedor. */
  whatsappClick(id: string): Observable<WhatsappClickResponse> {
    return this.http.post<WhatsappClickResponse>(`${this.baseUrl}/${id}/whatsapp-click`, {});
  }

  private toFormData(value: Partial<ProductFormValue>): FormData {
    const formData = new FormData();
    if (value.name !== undefined) formData.append('name', value.name);
    if (value.description !== undefined) formData.append('description', value.description);
    if (value.categoryId !== undefined) formData.append('categoryId', value.categoryId);
    if (value.priceCents !== undefined) formData.append('priceCents', String(value.priceCents));
    if (value.photos !== undefined) {
      value.photos.forEach((file) => formData.append('photos', file, file.name));
    }
    return formData;
  }
}
