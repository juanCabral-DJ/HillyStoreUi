import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * URL base para todas las peticiones a la API.
 * Por defecto es '/api' o lo definido en environment.apiUrl.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => environment.apiUrl ?? '/api',
});

/**
 * URL base para servir archivos multimedia (imágenes subidas).
 * En desarrollo apunta al backend (p. ej. 'http://localhost:5000').
 */
export const MEDIA_BASE_URL = new InjectionToken<string>('MEDIA_BASE_URL', {
  providedIn: 'root',
  factory: () => environment.mediaBaseUrl ?? '',
});

/**
 * Proveedor funcional para obtener el token JWT actual sin acoplar el interceptor a AuthService
 * (evitando dependencias circulares ya que AuthService consume ApiClient).
 */
export const AUTH_TOKEN_PROVIDER = new InjectionToken<() => string | null>('AUTH_TOKEN_PROVIDER', {
  providedIn: 'root',
  factory: () => () => null,
});
