import { InjectionToken } from '@angular/core';

/**
 * URL base para todas las peticiones a la API.
 * Por defecto es '/api', pero puede sobreescribirse en SSR o producción si el backend corre en otro host.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api',
});

/**
 * Proveedor funcional para obtener el token JWT actual sin acoplar el interceptor a AuthService
 * (evitando dependencias circulares ya que AuthService consume ApiClient).
 */
export const AUTH_TOKEN_PROVIDER = new InjectionToken<() => string | null>('AUTH_TOKEN_PROVIDER', {
  providedIn: 'root',
  factory: () => () => null,
});
