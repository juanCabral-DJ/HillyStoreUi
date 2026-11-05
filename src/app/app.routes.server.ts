import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Se activarán conforme se agreguen las rutas en app.routes.ts:
  // { path: 'pedidos-shein', renderMode: RenderMode.Prerender },
  // { path: 'admin/**', renderMode: RenderMode.Client },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
