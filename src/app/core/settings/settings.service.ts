import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, REQUEST, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, of, tap } from 'rxjs';
import { StoreSettingsDto } from '../../shared/contracts';
import { API_BASE_URL, ApiClient } from '../api';

export const DEFAULT_STORE_SETTINGS: StoreSettingsDto = {
  whatsAppNumber: '',
  address: 'Baní, Provincia Peravia, República Dominicana',
  opensAt: '09:00',
  closesAt: '17:00',
  instagramUrl: '',
  facebookUrl: null,
  tiktokUrl: null,
  depositPercentage: 50,
  sheinMinDays: 15,
  sheinMaxDays: 20,
};

/**
 * Carga una vez los ajustes de la tienda y los comparte en toda la app,
 * manteniendo valores por defecto seguros si la API falla o aún no responde.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly api = inject(ApiClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly request = inject(REQUEST, { optional: true });
  private loaded = false;

  private readonly state = signal<StoreSettingsDto>(DEFAULT_STORE_SETTINGS);
  readonly loading = signal<boolean>(false);

  /** Ajustes actuales (siempre tiene al menos los valores por defecto) */
  readonly settings = this.state.asReadonly();

  /** Selectores computados listos para usar en templates y servicios */
  readonly whatsAppNumber = computed(() => this.state().whatsAppNumber.trim());
  readonly hasWhatsApp = computed(() => this.whatsAppNumber().replace(/\D/g, '').length >= 10);
  readonly depositPercentage = computed(() => this.state().depositPercentage);
  readonly sheinDaysRange = computed(
    () => `${this.state().sheinMinDays} a ${this.state().sheinMaxDays} días`
  );

  /**
   * Carga los ajustes desde la API una sola vez.
   * Si la API falla (o durante prerender estático sin backend), conserva `DEFAULT_STORE_SETTINGS`.
   */
  load(force = false): Observable<StoreSettingsDto> {
    if (this.loaded && !force) {
      return of(this.state());
    }

    // En prerender de compilación (sin REQUEST ni URL absoluta), evitamos llamar a '/api/settings'
    if (!this.isBrowser && !this.request && this.baseUrl.startsWith('/')) {
      return of(this.state());
    }

    this.loading.set(true);
    return this.api.getSettings().pipe(
      tap((remote) => {
        this.state.set({ ...DEFAULT_STORE_SETTINGS, ...remote });
        this.loaded = true;
      }),
      catchError(() => {
        this.loaded = true;
        return of(this.state());
      }),
      finalize(() => this.loading.set(false))
    );
  }

  /** Actualiza el estado en memoria tras guardar cambios en /admin/ajustes */
  setSettings(updated: StoreSettingsDto): void {
    this.state.set(updated);
    this.loaded = true;
  }
}
