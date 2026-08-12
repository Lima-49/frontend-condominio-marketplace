import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Botao fixo "Chamar no WhatsApp" da tela de Detalhe.
 *
 * Puramente apresentacional: quem decide se pode habilitar (produto vendido -> 409,
 * proprio anuncio -> 400) e a tela de Detalhe, que tambem faz a chamada a
 * POST /products/:id/whatsapp-click e abre a URL retornada pelo backend.
 * Este componente nunca conhece o numero de telefone (o backend nunca o expoe aqui).
 */
@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  templateUrl: './whatsapp-button.component.html',
  styleUrl: './whatsapp-button.component.scss'
})
export class WhatsappButtonComponent {
  @Input() disabled = false;
  @Input() loading = false;
  @Input() disabledMessage: string | null = null;
  @Input() label = 'Chamar no WhatsApp';
  @Input() loadingLabel = 'Abrindo WhatsApp...';
  @Output() activate = new EventEmitter<void>();

  onClick(): void {
    if (!this.disabled && !this.loading) {
      this.activate.emit();
    }
  }
}
