import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Category } from '../../core/models/category.model';
import { ProductListItem } from '../../core/models/product.model';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { CategoryFilterComponent } from '../../shared/components/category-filter/category-filter.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';

const PAGE_SIZE = 20;

/**
 * Vitrine (GET /products): busca por texto, filtro por categoria, grid de produtos e
 * botao flutuante "Anunciar". Lista sempre restrita ao condominio do usuario logado
 * (o backend deriva isso do token — o frontend nunca envia condominiumId).
 */
@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [
    RouterLink,
    SearchBarComponent,
    CategoryFilterComponent,
    ProductCardComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './showcase.component.html',
  styleUrl: './showcase.component.scss'
})
export class ShowcaseComponent implements OnInit {
  products: ProductListItem[] = [];
  categories: Category[] = [];

  search = '';
  selectedCategoryId: string | null = null;

  page = 1;
  total = 0;

  loading = true;
  loadingMore = false;
  errorMessage: string | null = null;

  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.categoryService.list().subscribe({
      next: (categories) => (this.categories = categories),
      // Falha ao carregar categorias nao deve travar a vitrine: so o filtro fica indisponivel.
      error: () => (this.categories = [])
    });

    this.fetchProducts();
  }

  get hasMore(): boolean {
    return this.products.length < this.total;
  }

  onSearch(term: string): void {
    this.search = term;
    this.fetchProducts();
  }

  onCategoryChange(categoryId: string | null): void {
    this.selectedCategoryId = categoryId;
    this.fetchProducts();
  }

  loadMore(): void {
    if (this.loadingMore || !this.hasMore) {
      return;
    }
    this.loadingMore = true;
    this.page += 1;
    this.fetchProducts(true);
  }

  private fetchProducts(append = false): void {
    if (!append) {
      this.page = 1;
      this.loading = true;
    }
    this.errorMessage = null;

    this.productService
      .list({
        search: this.search || undefined,
        categoryId: this.selectedCategoryId || undefined,
        page: this.page,
        limit: PAGE_SIZE
      })
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
          this.errorMessage = 'Nao foi possivel carregar os produtos. Tente novamente.';
          if (!append) {
            this.products = [];
            this.total = 0;
          }
        }
      });
  }
}
