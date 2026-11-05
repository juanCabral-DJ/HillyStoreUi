import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, REQUEST, computed, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const COOKIE_NAME = 'hilly-theme';
const DARK_CLASS = 'app-dark'; // debe coincidir con darkModeSelector en theme.providers.ts
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Maneja el modo claro/oscuro.
 * La elección se guarda en una cookie (no en localStorage) para que el servidor
 * pueda leerla y renderizar el tema correcto desde el primer pantallazo.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly request = inject(REQUEST, { optional: true });

  readonly mode = signal<ThemeMode>(this.initialMode());
  readonly isDark = computed(() => this.mode() === 'dark');

  constructor() {
    this.apply(this.mode());
  }

  toggle(): void {
    this.set(this.isDark() ? 'light' : 'dark');
  }

  set(mode: ThemeMode): void {
    this.mode.set(mode);
    this.apply(mode);
    if (this.isBrowser) {
      this.doc.cookie = `${COOKIE_NAME}=${mode}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`;
    }
  }

  private apply(mode: ThemeMode): void {
    this.doc.documentElement.classList.toggle(DARK_CLASS, mode === 'dark');
  }

  private initialMode(): ThemeMode {
    const saved = this.readCookie();
    if (saved) return saved;
    if (this.isBrowser && matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  }

  private readCookie(): ThemeMode | null {
    const raw = this.isBrowser
      ? this.doc.cookie
      : (this.request?.headers.get('cookie') ?? '');
    const match = raw.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=(light|dark)`));
    return match ? (match[1] as ThemeMode) : null;
  }
}
