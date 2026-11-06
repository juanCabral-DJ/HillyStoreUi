import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../core/auth';
import { ThemeService } from '../../core/theme';
import { AdminNavItem } from '../interface/navitem.interface';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss',
})
export class AdminShellComponent {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  protected readonly sidebarOpen = signal<boolean>(false);

  protected readonly navItems: AdminNavItem[] = [
    { label: 'Prendas y Stock', icon: 'pi pi-tag', routerLink: '/admin/productos' },
    { label: 'Categorías', icon: 'pi pi-folder', routerLink: '/admin/categorias' },
    { label: 'Ajustes de Tienda', icon: 'pi pi-cog', routerLink: '/admin/ajustes' },
    { label: 'Preguntas Frecuentes', icon: 'pi pi-question-circle', routerLink: '/admin/faqs' },
  ];

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.auth.logout(true);
  }
}
