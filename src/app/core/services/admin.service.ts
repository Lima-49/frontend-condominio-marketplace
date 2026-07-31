import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';
import { CategoryProductCount, CondominiumUserCount, CreateCategoryPayload, ProductsPerUserResponse } from '../models/admin.model';

/**
 * Integra com o modulo `admin` (NestJS) do Painel Administrativo da Plataforma.
 * Todas as rotas exigem JWT + `role = platform_admin`; `resident` recebe `403`
 * (tratado pela Camada 2 do AdminDashboardComponent, ver ADMIN_DASHBOARD_DESIGN.md secao 2).
 * Isolado propositalmente do restante do app (nunca compartilhar service com
 * ProductsService/CategoryService usados pelo morador comum — ver riscos do PO).
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly baseUrl = `${environment.apiUrl}/admin`;

  constructor(private readonly http: HttpClient) {}

  usersByCondominium(): Observable<CondominiumUserCount[]> {
    return this.http.get<CondominiumUserCount[]>(`${this.baseUrl}/metrics/users-by-condominium`);
  }

  topCategories(): Observable<CategoryProductCount[]> {
    return this.http.get<CategoryProductCount[]>(`${this.baseUrl}/metrics/top-categories`);
  }

  productsPerUser(): Observable<ProductsPerUserResponse> {
    return this.http.get<ProductsPerUserResponse>(`${this.baseUrl}/metrics/products-per-user`);
  }

  /** Retorna a categoria criada no mesmo formato de GET /categories (id, name, slug). */
  createCategory(payload: CreateCategoryPayload): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/categories`, payload);
  }
}
