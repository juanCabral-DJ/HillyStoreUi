import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { AUTH_TOKEN_PROVIDER } from '../api';
import { AuthService } from './auth.service';

/**
 * Conecta `AuthService` con `AUTH_TOKEN_PROVIDER` para que el `authInterceptor`
 * obtenga el token JWT actual sin crear dependencias circulares.
 */
export function provideAuth(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: AUTH_TOKEN_PROVIDER,
      useFactory: () => {
        const auth = inject(AuthService);
        return () => auth.token();
      },
    },
  ]);
}
