import { Component, Input } from '@angular/core';

/** Estado vazio generico (ex.: "nenhum produto encontrado"), reusado nas listagens. */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  @Input() icon = '📭';
  @Input({ required: true }) message!: string;
  @Input() description = '';
}
