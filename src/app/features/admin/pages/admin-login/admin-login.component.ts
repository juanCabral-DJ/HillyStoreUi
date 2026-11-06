import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../../core/auth';
import { SeoService } from '../../../../core/seo';
import { ThemeService } from '../../../../core/theme';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
})
export class AdminLoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  protected readonly theme = inject(ThemeService);

  readonly email = signal<string>('');
  readonly password = signal<string>('');
  readonly showPassword = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  private returnUrl: string = '/admin/productos';

  ngOnInit(): void {
    this.seo.setPageSeo({
      title: 'Acceso Administración | HillyStore',
      description: 'Panel de administración privado de HillyStore.',
      canonicalPath: '/admin/login',
    });

    const queryReturn = this.route.snapshot.queryParamMap.get('returnUrl');
    if (queryReturn) {
      this.returnUrl = queryReturn;
    }

    if (this.auth.isAuthenticated()) {
      void this.router.navigateByUrl(this.returnUrl);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    const trimmedEmail = this.email().trim();
    const currentPass = this.password();

    if (!trimmedEmail || !currentPass) {
      this.errorMessage.set('Por favor completa todos los campos.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.auth.login({ email: trimmedEmail, password: currentPass }).subscribe({
      next: () => {
        this.isLoading.set(false);
        void this.router.navigateByUrl(this.returnUrl);
      },
      error: (err: unknown) => {
        this.isLoading.set(false);
        const serverMsg =
          err && typeof err === 'object' && 'error' in err && typeof (err as { error: { message?: string } }).error === 'object'
            ? (err as { error: { message?: string } }).error?.message
            : null;
        this.errorMessage.set(
          serverMsg || 'Credenciales incorrectas o servidor no disponible.'
        );
      },
    });
  }
}
