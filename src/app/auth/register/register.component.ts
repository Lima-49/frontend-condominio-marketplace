import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ApiErrorBody } from '../../core/models/api.model';
import { Condominium } from '../../core/models/condominium.model';
import { CondominiumService } from '../../core/services/condominium.service';
import { AuthService } from '../../core/services/auth.service';
import { passwordsMatchValidator, whatsappValidator } from '../../shared/validators/custom-validators';

/**
 * Tela de Cadastro (Design Brief): nome completo, whatsapp, condominio, bloco,
 * apartamento (uso interno, nunca aparece no anuncio — politica de privacidade do MVP),
 * email, senha, confirmacao de senha.
 *
 * Condominio vem de GET /condominiums (rota publica) para o morador selecionar, evitando
 * texto livre / condominios duplicados por digitacao (DECISIONS_LOG.md #1).
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  // Ver comentario equivalente em LoginComponent sobre ordem de inicializacao de campos.
  private readonly fb = inject(FormBuilder);
  private readonly condominiumService = inject(CondominiumService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
      whatsapp: ['', [Validators.required, whatsappValidator()]],
      condominiumId: ['', [Validators.required]],
      block: ['', [Validators.required, Validators.maxLength(20)]],
      apartment: ['', [Validators.required, Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirmation: ['', [Validators.required]]
    },
    { validators: passwordsMatchValidator() }
  );

  condominiums: Condominium[] = [];
  loadingCondominiums = true;
  condominiumsError = false;

  submitting = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.condominiumService.list().subscribe({
      next: (condominiums) => {
        this.condominiums = condominiums;
        this.loadingCondominiums = false;
      },
      error: () => {
        this.loadingCondominiums = false;
        this.condominiumsError = true;
      }
    });
  }

  submit(): void {
    this.errorMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const value = this.form.getRawValue();

    this.authService
      .register({
        fullName: value.fullName!,
        whatsapp: value.whatsapp!,
        condominiumId: value.condominiumId!,
        block: value.block!,
        apartment: value.apartment!,
        email: value.email!,
        password: value.password!,
        passwordConfirmation: value.passwordConfirmation!
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/login'], { queryParams: { registered: '1' } });
        },
        error: (error: ApiErrorBody) => {
          this.submitting = false;
          this.errorMessage = error.message || 'Nao foi possivel concluir o cadastro.';
        }
      });
  }
}
