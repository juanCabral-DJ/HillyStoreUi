import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { apiErrorInterceptor } from './api-error.interceptor';
import { API_BASE_URL } from './api.tokens';
import { authInterceptor } from './auth.interceptor';

export interface ProvideApiOptions {
  baseUrl?: string;
}

/**
 * Un solo punto de registro para la capa de datos HTTP.
 * Se agrega `provideApi()` en `app.config.ts`.
 */
export function provideApi(options?: ProvideApiOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    ...(options?.baseUrl ? [{ provide: API_BASE_URL, useValue: options.baseUrl }] : []),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, apiErrorInterceptor])
    ),
  ]);
}
