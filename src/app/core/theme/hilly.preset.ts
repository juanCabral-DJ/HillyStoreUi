import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Tema de HillyStore: rosa y blanco sobre el preset Aura de PrimeNG.
 * - Claro: botones en rosa 600 con texto blanco.
 * - Oscuro: botones en rosa 400 con texto oscuro (mantiene el contraste).
 */
export const HillyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fff0f6',
      100: '#ffdcea',
      200: '#ffc2da',
      300: '#ffa6cb',
      400: '#ff8fbe',
      500: '#e0498a',
      600: '#c72a6a',
      700: '#a82058',
      800: '#861a47',
      900: '#641335',
      950: '#450d24',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.600}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.700}',
          activeColor: '{primary.800}',
        },
        surface: {
          0: '#ffffff',
          50: '#fdf7fa',
          100: '#fdeef4',
          200: '#f0c9da',
          300: '#e0aec5',
          400: '#a8909c',
          500: '#6b5560',
          600: '#54424b',
          700: '#3f313a',
          800: '#33242d',
          900: '#2a1620',
          950: '#1d0f16',
        },
      },
      dark: {
        primary: {
          color: '{primary.400}',
          contrastColor: '{surface.950}',
          hoverColor: '{primary.300}',
          activeColor: '{primary.200}',
        },
        surface: {
          0: '#ffffff',
          50: '#fbeff5',
          100: '#f1dde8',
          200: '#d9c3d0',
          300: '#b99fae',
          400: '#8f7686',
          500: '#6b5460',
          600: '#4a3243',
          700: '#3a2735',
          800: '#2e1f2a',
          900: '#251821',
          950: '#17101a',
        },
      },
    },
  },
  components: {
    drawer: {
      colorScheme: {
        light: {
          root: {
            background: '{surface.0}', // Blanco sólido
          },
        },
        dark: {
          root: {
            background: '{surface.900}', // Sólido oscuro (#251821)
          },
        },
      },
    },
  },
});
