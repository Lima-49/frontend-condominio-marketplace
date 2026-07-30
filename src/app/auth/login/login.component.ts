import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ApiErrorBody } from '../../core/models/api.model';
import { AuthService } from '../../core/services/auth.service';

/**
 * Tela de Login (Design Brief: email, senha, botao entrar, link para cadastro).
 *
 * Validacao client-side com Reactive Forms: so feedback rapido de UX. A fonte de verdade
 * de validacao/autenticacao e sempre o backend (POST /auth/login) — ver CLAUDE.md.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  // `inject()` como campo, declarado antes de `form`, para poder usar `this.fb` no
  // inicializador de campo (initializers de campo rodam antes do corpo do constructor,
  // entao uma propriedade injetada via parametro do constructor ainda nao existiria aqui).
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  submitting = false;
  errorMessage: string | null = null;
  /** Mostrado quando o morador acabou de criar a conta (RegisterComponent redireciona pra ca). */
  justRegistered = false;

  ngOnInit(): void {
    this.justRegistered = this.route.snapshot.queryParamMap.get('registered') === '1';
  }

  submit(): void {
    this.errorMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const { email, password } = this.form.getRawValue();

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.submitting = false;
        const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');
        this.router.navigateByUrl(redirectTo || '/produtos');
      },
      error: (error: ApiErrorBody) => {
        this.submitting = false;
        // Backend nunca diferencia "email nao existe" de "senha errada" (evita user enumeration).
        this.errorMessage = error.message || 'Credenciais invalidas.';
      }
    });
  }
}
