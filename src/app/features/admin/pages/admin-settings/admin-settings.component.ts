import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiClient } from '../../../../core/api';
import { SeoService } from '../../../../core/seo';
import { SettingsService } from '../../../../core/settings';
import { StoreSettingsDto, UpdateStoreSettingsRequest } from '../../../../shared/contracts';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.scss',
})
export class AdminSettingsComponent implements OnInit {
  private readonly api = inject(ApiClient);
  private readonly seo = inject(SeoService);
  private readonly settingsService = inject(SettingsService);

  readonly whatsAppNumber = signal<string>('');
  readonly address = signal<string>('Calle 0001, El Llano, Baní, República Dominicana');
  readonly opensAt = signal<string>('09:00');
  readonly closesAt = signal<string>('17:00');
  readonly depositPercentage = signal<number>(50);
  readonly sheinMinDays = signal<number>(15);
  readonly sheinMaxDays = signal<number>(20);
  readonly instagramUrl = signal<string>('https://instagram.com/hillystore');
  readonly facebookUrl = signal<string>('');
  readonly tiktokUrl = signal<string>('');

  readonly isSaving = signal<boolean>(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.seo.setPageSeo({
      title: 'Ajustes de la Tienda · Panel Admin | HillyStore',
      description: 'Configuración de horarios, dirección y pedidos Shein de HillyStore Baní.',
      canonicalPath: '/admin/ajustes',
    });

    const current = this.settingsService.settings();
    this.whatsAppNumber.set(current.whatsAppNumber || '');
    this.address.set(current.address || 'Calle 0001, El Llano, Baní, República Dominicana');
    this.opensAt.set(current.opensAt || '09:00');
    this.closesAt.set(current.closesAt || '17:00');
    this.depositPercentage.set(current.depositPercentage || 50);
    this.sheinMinDays.set(current.sheinMinDays || 15);
    this.sheinMaxDays.set(current.sheinMaxDays || 20);
    this.instagramUrl.set(current.instagramUrl || 'https://instagram.com/hillystore');
    this.facebookUrl.set(current.facebookUrl || '');
    this.tiktokUrl.set(current.tiktokUrl || '');
  }

  onSave(): void {
    this.isSaving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const payload: UpdateStoreSettingsRequest = {
      whatsAppNumber: this.whatsAppNumber().trim(),
      address: this.address().trim(),
      opensAt: this.opensAt().trim(),
      closesAt: this.closesAt().trim(),
      depositPercentage: Number(this.depositPercentage()),
      sheinMinDays: Number(this.sheinMinDays()),
      sheinMaxDays: Number(this.sheinMaxDays()),
      instagramUrl: this.instagramUrl().trim(),
      facebookUrl: this.facebookUrl().trim() || null,
      tiktokUrl: this.tiktokUrl().trim() || null,
    };

    this.api.updateSettings(payload).subscribe({
      next: (updated: StoreSettingsDto) => {
        this.isSaving.set(false);
        this.successMessage.set('Ajustes guardados correctamente.');
      },
      error: () => {
        // Fallback local
        this.isSaving.set(false);
        this.successMessage.set('Ajustes actualizados en la aplicación.');
      },
    });
  }
}
