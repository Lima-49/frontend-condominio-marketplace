import { Component, Input } from '@angular/core';

/** Indicador de carregamento generico, reusado nas listagens e telas de detalhe/form. */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  templateUrl: './loading-spinner.component.html'
})
export class LoadingSpinnerComponent {
  @Input() message = 'Carregando...';
}
