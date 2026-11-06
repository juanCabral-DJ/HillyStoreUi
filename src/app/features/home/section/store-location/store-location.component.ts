import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AnimateOnScroll } from 'primeng/animateonscroll';
import { SettingsService } from '../../../../core/settings';
import { WhatsappService } from '../../../../core/whatsapp';

@Component({
  selector: 'app-store-location',
  standalone: true,
  imports: [CommonModule, AnimateOnScroll],
  templateUrl: './store-location.component.html',
  styleUrl: './store-location.component.scss',
})
export class StoreLocationComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly whatsapp = inject(WhatsappService);
  protected readonly settingsService = inject(SettingsService);

  readonly settings = this.settingsService.settings;

  /** Estado en vivo (Abierto / Cerrado) basado en la hora local */
  readonly storeStatus = computed(() => {
    const now = new Date();
    // Hora en Baní, República Dominicana (UTC-4)
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Santo_Domingo',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      weekday: 'short',
    };

    const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(now);
    const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '12', 10);
    const weekday = parts.find((p) => p.type === 'weekday')?.value || 'Mon';

    const opens = 9;
    const closes = 17;
    const isSunday = weekday === 'Sun';

    if (isSunday) {
      return {
        isOpen: false,
        label: 'Cerrado los domingos',
        sub: 'Abrimos mañana a las 9:00 a.m.',
      };
    }

    if (hour >= opens && hour < closes) {
      return {
        isOpen: true,
        label: 'Abierto ahora',
        sub: 'Cierra hoy a las 5:00 p.m.',
      };
    }

    return {
      isOpen: false,
      label: 'Cerrado en este momento',
      sub: 'Abrimos a las 9:00 a.m.',
    };
  });

  /** URL del mapa embebido de Google Maps con sanitización segura */
  readonly mapEmbedUrl = computed<SafeResourceUrl>(() => {
    const rawAddress = this.settings().address || 'Calle 0001, El Llano, Baní, República Dominicana';
    const query = encodeURIComponent(rawAddress);
    const url = `https://maps.google.com/maps?q=${query}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  /** URL para abrir la ruta en la aplicación de Google Maps / GPS del móvil */
  readonly directionsUrl = computed(() => {
    const rawAddress = this.settings().address || 'Calle 0001, El Llano, Baní, República Dominicana';
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(rawAddress)}`;
  });

  onAskLocationWhatsApp(): void {
    this.whatsapp.openGeneralInquiry(
      '¡Hola HillyStore! Me gustaría que me envíen la ubicación exacta de la tienda en Baní para pasar a visitarlos.'
    );
  }
}
