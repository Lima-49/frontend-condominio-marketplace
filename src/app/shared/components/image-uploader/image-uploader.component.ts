import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB, espelha o limite do backend (API_SPEC.md secao 4)

/**
 * Upload de foto do produto. MVP de frontend implementa apenas 1 foto por anuncio
 * (Design Brief / MVP_SCOPE tratam "multiplas fotos" como Could Have futuro), mesmo o
 * contrato de API ja aceitando ate 5 (`photos[]`) — ver API_SPEC.md secao 6, item 7.
 *
 * Implementa ControlValueAccessor para funcionar como `formControlName="photos"` dentro
 * do Reactive Form de Criar/Editar produto, com valor sempre `File[]` (0 ou 1 item).
 */
@Component({
  selector: 'app-image-uploader',
  standalone: true,
  templateUrl: './image-uploader.component.html',
  styleUrl: './image-uploader.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUploaderComponent),
      multi: true
    }
  ]
})
export class ImageUploaderComponent implements ControlValueAccessor {
  /** URL de uma foto ja existente (modo edicao), exibida ate o usuario escolher um novo arquivo. */
  @Input() existingImageUrl: string | null = null;
  @Output() fileError = new EventEmitter<string | null>();

  previewUrl: string | null = null;
  disabled = false;

  private files: File[] = [];
  private onChange: (value: File[]) => void = () => {};
  private onTouched: () => void = () => {};

  get hasPreview(): boolean {
    return !!this.previewUrl || !!this.existingImageUrl;
  }

  get displayUrl(): string | null {
    return this.previewUrl ?? this.existingImageUrl;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.onTouched();

    if (!file) {
      return;
    }

    const validationError = this.validate(file);
    if (validationError) {
      this.fileError.emit(validationError);
      input.value = '';
      return;
    }

    this.fileError.emit(null);
    this.files = [file];
    this.previewUrl = URL.createObjectURL(file);
    this.onChange(this.files);
  }

  removeFile(): void {
    this.files = [];
    this.previewUrl = null;
    this.existingImageUrl = null;
    this.onChange(this.files);
  }

  private validate(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Formato invalido. Envie uma imagem JPEG, PNG ou WEBP.';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return 'Arquivo muito grande. Tamanho maximo: 5MB.';
    }
    return null;
  }

  // ControlValueAccessor
  writeValue(value: File[] | null): void {
    this.files = value ?? [];
    if (this.files.length === 0) {
      this.previewUrl = null;
    }
  }

  registerOnChange(fn: (value: File[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
