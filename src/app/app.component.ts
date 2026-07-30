import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    // Restaura a sessao (GET /auth/me) quando ha token salvo, ao recarregar a pagina.
    this.authService.hydrateSession();
  }
}
