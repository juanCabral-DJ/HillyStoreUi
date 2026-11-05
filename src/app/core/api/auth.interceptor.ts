import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL, AUTH_TOKEN_PROVIDER } from './api.tokens';

/**
 * Adjunta el encabezado `Authorization: Bearer <token>` únicamente en las peticiones
 * dirigidas a los endpoints de administración (`/api/admin/**`).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const baseUrl = inject(API_BASE_URL).replace(/\/+$/, '');
  const isAdminEndpoint = req.url.startsWith(`${baseUrl}/admin`);

  if (!isAdminEndpoint) {
    return next(req);
  }

  const getToken = inject(AUTH_TOKEN_PROVIDER);
  const token = getToken();

  if (!token) {
    return next(req);
  }

  const authorizedReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authorizedReq);
};
