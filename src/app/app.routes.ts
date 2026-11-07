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
        title: 'HillyStore · Tienda de ropa en Baní y Pedidos Shein',
        component: HomeComponent,
      },
      {
        path: 'catalogo',
        title: 'Catálogo de Ropa en Stock en Baní · Mujeres y Hombres | HillyStore',
        loadComponent: () =>
          import('./features/catalog').then((m) => m.CatalogListComponent),
      },
      {
        path: 'catalogo/:slug',
        title: 'Prenda en Stock | HillyStore',
        loadComponent: () =>
          import('./features/catalog').then((m) => m.ProductDetailComponent),
      },
      {
        path: 'pedidos-shein',
        title: 'Pedidos de Shein a Baní (50% anticipo) | HillyStore',
        loadComponent: () =>
          import('./features/shein-orders').then((m) => m.SheinOrdersComponent),
      },
    ],
  },

  // Login de administración (sin layout)
  {
    path: 'admin/login',
    title: 'Iniciar Sesión · Panel Administrativo | HillyStore',
    loadComponent: () =>
      import('./features/admin').then((m) => m.AdminLoginComponent),
  },

  // Panel de administración protegido (lazy-loaded shell)
  {
    path: 'admin',
    title: 'Panel Administrativo | HillyStore',
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
        title: 'Prendas y Stock · Admin | HillyStore',
        loadComponent: () =>
          import('./features/admin').then((m) => m.AdminProductsComponent),
      },
      {
        path: 'categorias',
        title: 'Categorías de Ropa · Admin | HillyStore',
        loadComponent: () =>
          import('./features/admin').then((m) => m.AdminCategoriesComponent),
      },
      {
        path: 'ajustes',
        title: 'Ajustes de la Tienda · Admin | HillyStore',
        loadComponent: () =>
          import('./features/admin').then((m) => m.AdminSettingsComponent),
      },
      {
        path: 'faqs',
        title: 'Preguntas Frecuentes · Admin | HillyStore',
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
