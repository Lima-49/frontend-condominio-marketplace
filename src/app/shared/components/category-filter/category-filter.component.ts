import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Category } from '../../../core/models/category.model';

/** Chips de categoria da Vitrine. `null` representa "Todas". */
@Component({
  selector: 'app-category-filter',
  standalone: true,
  templateUrl: './category-filter.component.html',
  styleUrl: './category-filter.component.scss'
})
export class CategoryFilterComponent {
  @Input() categories: Category[] = [];
  @Input() selectedCategoryId: string | null = null;
  @Output() categoryChange = new EventEmitter<string | null>();

  select(categoryId: string | null): void {
    if (categoryId !== this.selectedCategoryId) {
      this.categoryChange.emit(categoryId);
    }
  }
}
