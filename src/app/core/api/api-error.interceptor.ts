import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '../../shared/contracts';

/**
 * Normaliza cualquier error HTTP al contrato `ApiError` definido en la sección 6 del plan:
 * `{ status, code, message, errors? }`.
 */
export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: unknown) => {
      const normalized = normalizeApiError(err);
      return throwError(() => normalized);
    })
  );
};

function normalizeApiError(err: unknown): ApiError {
  if (err instanceof HttpErrorResponse) {
    const payload = err.error;

    // Si el backend ya devolvió el formato estándar { status, code, message, errors? }
    if (isBackendErrorPayload(payload)) {
      return {
        status: payload.status ?? err.status,
        code: payload.code,
        message: payload.message,
        ...(payload.errors ? { errors: payload.errors } : {}),
      };
    }

    // Error de red / servidor inalcanzable o CORS
    if (err.status === 0) {
      return {
        status: 0,
        code: 'NETWORK_ERROR',
        message: 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.',
      };
    }

    return {
      status: err.status,
      code: defaultCodeForStatus(err.status),
      message: defaultMessageForStatus(err.status),
    };
  }

  return {
    status: 500,
    code: 'UNKNOWN_ERROR',
    message: 'Ocurrió un error inesperado.',
  };
}

function isBackendErrorPayload(
  value: unknown
): value is Partial<ApiError> & { code: string; message: string } {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate['code'] === 'string' && typeof candidate['message'] === 'string';
}

function defaultCodeForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'VALIDATION_ERROR';
    case 429:
      return 'TOO_MANY_REQUESTS';
    default:
      return 'SERVER_ERROR';
  }
}

function defaultMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'La solicitud contiene datos inválidos.';
    case 401:
      return 'Tu sesión ha expirado o no tienes autorización.';
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'El recurso solicitado no fue encontrado.';
    case 409:
      return 'No se pudo completar la operación por un conflicto con los datos actuales.';
    case 422:
      return 'Revisa los campos marcados e inténtalo de nuevo.';
    case 429:
      return 'Demasiados intentos. Por favor espera un momento antes de volver a intentar.';
    default:
      return 'Ocurrió un error en el servidor. Inténtalo más tarde.';
  }
}
