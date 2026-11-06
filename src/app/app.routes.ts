import { Routes } from '@angular/router';
import { adminAuthGuard } from './core/auth';
import { HomeComponent } from './features';
import { PublicShellComponent } from './layout';

export const routes: Routes = [
  // Rutas públicas
  {
    path: '',
    component: PublicShellComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'catalogo',
        loadComponent: () =>
          import('./features/catalog').then((m) => m.CatalogListComponent),
      },
      {
        path: 'catalogo/:slug',
        loadComponent: () =>
          import('./features/catalog').then((m) => m.ProductDetailComponent),
      },
      {
        path: 'pedidos-shein',
        loadComponent: () =>
          import('./features/shein-orders').then((m) => m.SheinOrdersComponent),
      },
    ],
  },

  // Login de administración (sin layout)
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./features/admin').then((m) => m.AdminLoginComponent),
  },

  // Panel de administración protegido (lazy-loaded shell)
  {
    path: 'admin',
    loadComponent: () =>
      import('./layout').then((m) => m.AdminShellComponent),
    canActivate: [adminAuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'productos',
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/admin').then((m) => m.AdminProductsComponent),
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/admin').then((m) => m.AdminCategoriesComponent),
      },
      {
        path: 'ajustes',
        loadComponent: () =>
          import('./features/admin').then((m) => m.AdminSettingsComponent),
      },
      {
        path: 'faqs',
        loadComponent: () =>
          import('./features/admin').then((m) => m.AdminFaqsComponent),
      },
    ],
  },

  // Redirección por defecto
  {
    path: '**',
    redirectTo: '',
  },
];
