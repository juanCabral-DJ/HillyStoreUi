import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

/**
 * Única puerta al navegador para proteger el SSR.
 * Centraliza detección de entorno (browser/server), viewport, prefers-reduced-motion,
 * apertura de enlaces externos y acceso seguro a localStorage.
 */
@Injectable({ providedIn: 'root' })
export class PlatformService {
  readonly doc = inject(DOCUMENT);
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly isServer = !this.isBrowser;

  readonly viewportWidth = signal<number>(this.isBrowser ? window.innerWidth : 390);
  readonly isMobile = computed(() => this.viewportWidth() < 768);
  readonly prefersReducedMotion = signal<boolean>(
    this.isBrowser ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );

  constructor() {
    if (this.isBrowser) {
      window.addEventListener('resize', () => this.viewportWidth.set(window.innerWidth), {
        passive: true,
      });
    }
  }

  /** Abre una URL externa (como wa.me) de forma segura solo en navegador */
  openExternalUrl(url: string, target: '_blank' | '_self' = '_blank'): boolean {
    if (!this.isBrowser) return false;
    window.open(url, target, 'noopener,noreferrer');
    return true;
  }

  getStorageItem(key: string): string | null {
    if (!this.isBrowser) return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setStorageItem(key: string, value: string): void {
    if (!this.isBrowser) return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignorar si storage está bloqueado
    }
  }

  removeStorageItem(key: string): void {
    if (!this.isBrowser) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignorar
    }
  }
}
