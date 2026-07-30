import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ApiErrorBody } from '../../core/models/api.model';
import { Category } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { ImageUploaderComponent } from '../../shared/components/image-uploader/image-uploader.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { centsToReaisInput, minFilesValidator, moneyValidator, reaisToCents } from '../../shared/validators/custom-validators';

/**
 * Tela de Criar/Editar anuncio.
 *
 * - Criar (`/produtos/novo`): POST /products, exige nome, descricao, categoria, valor e
 *   pelo menos 1 foto (regra reforcada aqui, mas a validacao definitiva e do backend, dentro
 *   de uma transacao — API_SPEC.md secao 4 / DATABASE_MODEL.md).
 * - Editar (`/produtos/:id/editar`): PATCH /products/:id, todos os campos opcionais; a foto
 *   so e reenviada se o usuario escolher uma nova (senao mantem a atual no backend).
 *   Permitido mesmo com produto "vendido" (DECISIONS_LOG.md #3).
 */
@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ImageUploaderComponent, LoadingSpinnerComponent],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {
  // Ver comentario equivalente em LoginComponent sobre ordem de inicializacao de campos.
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.required]],
    categoryId: ['', [Validators.required]],
    price: ['', [Validators.required, moneyValidator()]],
    photos: this.fb.control<File[]>([])
  });

  categories: Category[] = [];
  loadingCategories = true;

  isEditMode = false;
  productId: string | null = null;
  existingImageUrl: string | null = null;

  loadingProduct = false;
  submitting = false;
  errorMessage: string | null = null;
  photoError: string | null = null;

  ngOnInit(): void {
    this.categoryService.list().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loadingCategories = false;
      },
      error: () => (this.loadingCategories = false)
    });

    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId;

    if (this.isEditMode) {
      // Modo edicao: foto existente ja publicada, entao nao e obrigatorio escolher uma nova.
      this.loadingProduct = true;
      this.productService.getById(this.productId!).subscribe({
        next: (product) => {
          this.form.patchValue({
            name: product.name,
            description: product.description,
            categoryId: product.category.id,
            price: centsToReaisInput(product.priceCents)
          });
          this.existingImageUrl = product.images?.[0]?.url ?? null;
          this.loadingProduct = false;
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel carregar este anuncio.';
          this.loadingProduct = false;
        }
      });
    } else {
      this.form.controls.photos.addValidators(minFilesValidator(1));
      this.form.controls.photos.updateValueAndValidity();
    }
  }

  submit(): void {
    this.errorMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const value = this.form.getRawValue();
    const priceCents = reaisToCents(value.price!);

    if (this.isEditMode) {
      this.productService
        .update(this.productId!, {
          name: value.name!,
          description: value.description!,
          categoryId: value.categoryId!,
          priceCents,
          // So reenvia fotos se o usuario escolheu uma nova (edicao mantem a atual senao).
          ...(value.photos!.length > 0 ? { photos: value.photos! } : {})
        })
        .subscribe({
          next: (product) => this.onSaved(product.id),
          error: (error: ApiErrorBody) => this.onError(error)
        });
    } else {
      this.productService
        .create({
          name: value.name!,
          description: value.description!,
          categoryId: value.categoryId!,
          priceCents,
          photos: value.photos!
        })
        .subscribe({
          next: (product) => this.onSaved(product.id),
          error: (error: ApiErrorBody) => this.onError(error)
        });
    }
  }

  private onSaved(productId: string): void {
    this.submitting = false;
    this.router.navigate(['/produtos', productId]);
  }

  private onError(error: ApiErrorBody): void {
    this.submitting = false;
    this.errorMessage = error.message || 'Nao foi possivel salvar o anuncio. Verifique os dados e tente novamente.';
  }
}
