import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();

// 1. Indicar a Express que confíe en el reverse proxy de Render
app.set('trust proxy', true);

// 2. Permitir el dominio de Render y habilitar trustProxyHeaders en Angular SSR
const angularApp = new AngularNodeAppEngine({
  allowedHosts: [
    'localhost',
    'localhost:4200',
    'localhost:10000',
    'hillystoreui.onrender.com',
  ],
  trustProxyHeaders: true
});

/**
 * Sirve los archivos estáticos desde /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  })
);

/**
 * Maneja todas las demás peticiones con Angular SSR Engine
 */
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next()
    )
    .catch(next);
});

/**
 * Inicia el servidor si es el módulo principal
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
