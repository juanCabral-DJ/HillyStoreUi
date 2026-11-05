import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import { HillyPreset } from './hilly.preset';
import { ThemeService } from './theme.service';
 
/** Un solo punto de registro: se agrega `provideTheme()` en app.config.ts */
export function provideTheme(): EnvironmentProviders {
  return makeEnvironmentProviders([
    providePrimeNG({
      theme: {
        preset: HillyPreset,
        options: { darkModeSelector: '.app-dark', cssLayer: false },
      },
      ripple: true,
    }),
    // Instancia el servicio al arrancar para aplicar el tema antes del primer render
    provideAppInitializer(() => {
      inject(ThemeService);
    }),
  ]);
}
