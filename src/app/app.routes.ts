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
    ],
  },
];
