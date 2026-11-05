import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ThemeService } from '../../../core';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    FormsModule,
    ButtonModule,
    DrawerModule,
    ToggleSwitchModule,
    ToolbarModule
],
  templateUrl: './public-header.component.html',
  styleUrl: './public-header.component.scss',
})
export class PublicHeaderComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly drawerVisible = signal(false);

  protected readonly navItems = [
    { label: 'Pedidos Shein', routerLink: '/pedidos-shein', fragment: undefined, priority: true },
    { label: 'Catálogo', routerLink: '/catalogo', fragment: undefined, priority: false },
    { label: 'Cómo pedir', routerLink: '/', fragment: 'como-pedir', priority: false },
    { label: 'Contacto', routerLink: '/', fragment: 'visitanos', priority: false },
  ];
}
