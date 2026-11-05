import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AdminUserDto, AuthLoginRequest, AuthLoginResponse } from '../../shared/contracts';
import { ApiClient } from '../api';
import { PlatformService } from '../platform';

const STORAGE_KEY = 'hilly_admin_session';

interface StoredSession {
  token: string;
  expiresAt: string;
  user: AdminUserDto;
}

/**
 * Gestiona la sesión del administrador (login, logout, persistencia del JWT y estado reactivo).
 * Todo acceso a localStorage pasa por PlatformService para ser seguro en SSR.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiClient);
  private readonly platform = inject(PlatformService);
  private readonly router = inject(Router);

  private readonly session = signal<StoredSession | null>(this.restoreSession());

  readonly user = computed(() => this.session()?.user ?? null);
  readonly token = computed(() => {
    const current = this.session();
    if (!current) return null;
    if (this.isExpired(current.expiresAt)) return null;
    return current.token;
  });
  readonly isAuthenticated = computed(() => this.token() !== null);

  login(credentials: AuthLoginRequest): Observable<AuthLoginResponse> {
    return this.api.login(credentials).pipe(
      tap((response) => {
        const stored: StoredSession = {
          token: response.token,
          expiresAt: response.expiresAt,
          user: response.user,
        };
        this.session.set(stored);
        this.platform.setStorageItem(STORAGE_KEY, JSON.stringify(stored));
      })
    );
  }

  logout(redirectToLogin = true): void {
    this.session.set(null);
    this.platform.removeStorageItem(STORAGE_KEY);
    if (redirectToLogin) {
      void this.router.navigate(['/admin/login']);
    }
  }

  private restoreSession(): StoredSession | null {
    const raw = this.platform.getStorageItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as StoredSession;
      if (!parsed?.token || !parsed?.expiresAt || this.isExpired(parsed.expiresAt)) {
        this.platform.removeStorageItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      this.platform.removeStorageItem(STORAGE_KEY);
      return null;
    }
  }

  private isExpired(expiresAtIso: string): boolean {
    const expiresMs = Date.parse(expiresAtIso);
    if (Number.isNaN(expiresMs)) return true;
    return Date.now() >= expiresMs;
  }
}
