import { Routes } from '@angular/router';
import { HomeComponent } from './features';
import { PublicShellComponent } from './layout';

export const routes: Routes = [
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
];
