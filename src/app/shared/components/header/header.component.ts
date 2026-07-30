import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

/**
 * Header fixo no topo. Em mobile so mostra a marca (a navegacao fica no bottom nav);
 * a partir de tablet/desktop tambem mostra os links de navegacao (ver header.component.scss).
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  get userFirstName(): string {
    const user = this.authService.currentUser();
    return user?.fullName?.split(' ')[0] ?? '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
