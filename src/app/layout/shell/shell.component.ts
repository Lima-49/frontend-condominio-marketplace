import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

/**
 * Layout das rotas privadas (Vitrine, Detalhe, Criar/editar, Meus anuncios):
 * header fixo no topo + bottom nav fixo embaixo (mobile) + <router-outlet> no meio.
 * Login/Cadastro nao usam este shell (telas isoladas, sem navegacao do app logado).
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, BottomNavComponent],
  templateUrl: './shell.component.html'
})
export class ShellComponent {}
