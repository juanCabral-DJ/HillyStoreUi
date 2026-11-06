import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas administrativas solo en el cliente (no SSR)
  {
    path: 'admin/**',
    renderMode: RenderMode.Client,
  },
  // Rutas públicas renderizadas en el servidor
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
