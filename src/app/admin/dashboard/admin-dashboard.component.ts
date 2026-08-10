import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';

import { ApiErrorBody } from '../../core/models/api.model';
import { CategoryProductCount, CondominiumUserCount, ProductsPerUserResponse } from '../../core/models/admin.model';
import { Category } from '../../core/models/category.model';
import { AdminService } from '../../core/services/admin.service';
import { BarListComponent, BarListItem } from '../../shared/components/bar-list/bar-list.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { trimmedLengthValidator } from '../../shared/validators/custom-validators';

type PageState = 'loading' | 'error' | 'access-denied' | 'success';

interface MetricOk<T> {
  ok: true;
  data: T;
}
interface MetricFail {
  ok: false;
  error: ApiErrorBody;
}
type MetricResult<T> = MetricOk<T> | MetricFail;

/**
 * Painel Administrativo da Plataforma (`/admin`), restrito a `platform_admin`
 * (ver docs/product/ADMIN_DASHBOARD.md e docs/design/ADMIN_DASHBOARD_DESIGN.md).
 *
 * Camada 2 de seguranca client-side (a camada 1 e o `adminGuard`): busca as 3 metricas
 * de leitura em paralelo e so decide o que renderizar depois que TODAS responderem — nunca
 * secao por secao. Se qualquer uma vier com 403, a tela inteira vira `access-denied` e
 * nenhum dado das outras (mesmo as que tenham vindo 200) e exibido.
 */
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, BarListComponent, StatCardComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);

  @ViewChild('categoryNameInput') private readonly categoryNameInput?: ElementRef<HTMLInputElement>;

  pageState: PageState = 'loading';

  condominiums: CondominiumUserCount[] = [];
  categories: CategoryProductCount[] = [];
  productsPerUser: ProductsPerUserResponse | null = null;

  readonly categoryForm = this.fb.group({
    name: ['', [Validators.required, trimmedLengthValidator(2, 40)]]
  });

  categorySubmitting = false;
  categoryErrorMessage: string | null = null;
  categoryFieldError: string | null = null;
  categorySuccessMessage: string | null = null;

  ngOnInit(): void {
    this.loadDashboard();
  }

  get condominiumBarItems(): BarListItem[] {
    return this.condominiums.map((item) => ({ label: item.condominiumName, value: item.userCount }));
  }

  get categoryBarItems(): BarListItem[] {
    return this.categories.map((item) => ({ label: item.categoryName, value: item.productCount }));
  }

  /** Total de moradores (`resident`) cadastrados, derivado de H2 — usado pra decidir o estado da media (H4). */
  get totalResidents(): number {
    return this.condominiums.reduce((sum, item) => sum + item.userCount, 0);
  }

  get averageDisplay(): string {
    if (!this.productsPerUser || this.totalResidents === 0) {
      return '—';
    }
    return this.productsPerUser.average.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  get averageDescription(): string {
    if (!this.productsPerUser || this.totalResidents === 0) {
      return 'Ainda nao ha moradores cadastrados.';
    }
    return 'Total de anuncios ativos / moradores cadastrados.';
  }

  loadDashboard(): void {
    this.pageState = 'loading';

    forkJoin({
      condominiums: this.asMetric(this.adminService.usersByCondominium()),
      categories: this.asMetric(this.adminService.topCategories()),
      productsPerUser: this.asMetric(this.adminService.productsPerUser())
    }).subscribe((results) => {
      const failures = [results.condominiums, results.categories, results.productsPerUser].filter(
        (result): result is MetricFail => !result.ok
      );

      if (failures.some((failure) => failure.error.statusCode === 403)) {
        this.pageState = 'access-denied';
        return;
      }

      if (failures.length > 0) {
        this.pageState = 'error';
        return;
      }

      this.condominiums = (results.condominiums as MetricOk<CondominiumUserCount[]>).data;
      this.categories = (results.categories as MetricOk<CategoryProductCount[]>).data;
      this.productsPerUser = (results.productsPerUser as MetricOk<ProductsPerUserResponse>).data;
      this.pageState = 'success';
    });
  }

  submitCategory(): void {
    this.categorySuccessMessage = null;
    this.categoryErrorMessage = null;
    this.categoryFieldError = null;

    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const name = (this.categoryForm.controls.name.value ?? '').trim();
    this.categorySubmitting = true;

    this.adminService.createCategory({ name }).subscribe({
      next: (category) => this.onCategoryCreated(category),
      error: (error: ApiErrorBody) => this.onCategoryError(error)
    });
  }

  private asMetric<T>(source$: Observable<T>): Observable<MetricResult<T>> {
    return source$.pipe(
      map((data): MetricResult<T> => ({ ok: true, data })),
      catchError((error: ApiErrorBody): Observable<MetricResult<T>> => of({ ok: false, error }))
    );
  }

  private onCategoryCreated(category: Category): void {
    this.categorySubmitting = false;
    this.categorySuccessMessage = `Categoria "${category.name}" cadastrada com sucesso.`;
    this.categories = [...this.categories, { categoryId: category.id, categoryName: category.name, productCount: 0 }].sort(
      (a, b) => b.productCount - a.productCount
    );
    this.categoryForm.reset();
    this.categoryNameInput?.nativeElement.focus();
  }

  private onCategoryError(error: ApiErrorBody): void {
    this.categorySubmitting = false;
    const fieldError = error.details?.find((detail) => detail.field === 'name');
    if (fieldError) {
      this.categoryFieldError = fieldError.message;
    } else {
      this.categoryErrorMessage = error.message || 'Nao foi possivel cadastrar a categoria. Tente novamente.';
    }
  }
}
