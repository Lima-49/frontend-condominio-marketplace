import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/** Navegacao fixa no rodape, visivel apenas em telas pequenas (ver bottom-nav.component.scss). */
@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss'
})
export class BottomNavComponent {}
