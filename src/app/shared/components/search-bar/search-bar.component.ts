import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

/** Busca por texto da Vitrine (nome/descricao). Debounce interno evita 1 request por tecla. */
@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Buscar produtos...';
  @Input() set initialValue(value: string) {
    this.searchControl.setValue(value ?? '', { emitEvent: false });
  }
  @Output() search = new EventEmitter<string>();

  readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly destroyed$ = new Subject<void>();

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroyed$))
      .subscribe((value) => this.search.emit(value.trim()));
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  clear(): void {
    this.searchControl.setValue('');
  }
}
