import { Routes } from '@angular/router';

import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { ShellComponent } from './layout/shell/shell.component';

/**
 * Rotas privadas (Vitrine, Criar/editar, Detalhe, Meus anuncios) ficam dentro do ShellComponent
 * (header + bottom nav) e sao protegidas por `authGuard`. Login/Cadastro usam `guestGuard`
 * (usuario ja logado e redirecionado direto para a vitrine).
 */
export const routes: Routes = [
  { path: '', redirectTo: 'produtos', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'cadastro',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'produtos',
        loadComponent: () => import('./products/showcase/showcase.component').then((m) => m.ShowcaseComponent)
      },
      {
        path: 'produtos/novo',
        loadComponent: () => import('./products/product-form/product-form.component').then((m) => m.ProductFormComponent)
      },
      {
        path: 'produtos/:id/editar',
        loadComponent: () => import('./products/product-form/product-form.component').then((m) => m.ProductFormComponent)
      },
      {
        path: 'produtos/:id',
        loadComponent: () => import('./products/product-detail/product-detail.component').then((m) => m.ProductDetailComponent)
      },
      {
        path: 'meus-anuncios',
        loadComponent: () => import('./account/my-products/my-products.component').then((m) => m.MyProductsComponent)
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () => import('./admin/dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent)
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./layout/not-found/not-found.component').then((m) => m.NotFoundComponent)
  }
];
