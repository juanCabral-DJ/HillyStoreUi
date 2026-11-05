import { Injectable, computed, inject } from '@angular/core';
import { PlatformService } from '../platform';
import { SettingsService } from '../settings';

export interface SheinOrderWhatsAppPayload {
  customerName?: string;
  items: Array<{
    link: string;
    size: string;
    notes?: string;
  }>;
  generalNotes?: string;
}

export interface StockProductWhatsAppPayload {
  productName: string;
  productSlug: string;
  price: number;
  selectedSize?: string;
}

export type WhatsAppOpenResult =
  | { ok: true; url: string }
  | { ok: false; reason: 'MISSING_NUMBER' | 'SSR_ENVIRONMENT' };

/**
 * Arma los mensajes de Shein, de stock y de consulta general,
 * codifica el texto respetando tildes/ñ/saltos de línea, limpia el número
 * y previene abrir enlaces rotos si el número de WhatsApp no está configurado.
 */
@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private readonly settingsService = inject(SettingsService);
  private readonly platform = inject(PlatformService);

  /** Número limpio (solo dígitos, ej. '18095551234') */
  readonly cleanPhone = computed(() =>
    this.settingsService.whatsAppNumber().replace(/\D/g, '')
  );

  /** Indica si hay un número válido configurado para habilitar/avisar en los botones */
  readonly isConfigured = computed(() => this.cleanPhone().length >= 10);

  /** 1. Consulta general (botón flotante / sección contacto) */
  openGeneralInquiry(customText?: string): WhatsAppOpenResult {
    const message =
      customText?.trim() ||
      '¡Hola HillyStore! Me gustaría hacer una consulta sobre sus prendas y pedidos.';
    return this.openChat(message);
  }

  /** 2. Pedido de prenda en stock (Catálogo / Detalle de prenda) */
  openStockOrder(payload: StockProductWhatsAppPayload): WhatsAppOpenResult {
    const lines = [
      '¡Hola HillyStore! Quiero pedir esta prenda del catálogo:',
      `• *Prenda:* ${payload.productName}`,
      ...(payload.selectedSize ? [`• *Talla:* ${payload.selectedSize}`] : []),
      `• *Precio:* RD$ ${payload.price.toLocaleString('es-DO')}`,
      '',
      '¿Está disponible para coordinar el pago y la entrega?',
    ];
    return this.openChat(lines.join('\n'));
  }

  /** 3. Pedido por encargo de Shein (Formulario Shein) */
  openSheinOrder(payload: SheinOrderWhatsAppPayload): WhatsAppOpenResult {
    const deposit = this.settingsService.depositPercentage();
    const lines: string[] = ['¡Hola HillyStore! Quiero realizar un pedido de *Shein*:'];

    if (payload.customerName?.trim()) {
      lines.push(`• *Nombre:* ${payload.customerName.trim()}`);
    }

    lines.push('', '*Artículos:*');
    payload.items.forEach((item, index) => {
      const notesPart = item.notes?.trim() ? ` (${item.notes.trim()})` : '';
      lines.push(`${index + 1}. Talla: *${item.size.trim()}*${notesPart}\n   ${item.link.trim()}`);
    });

    if (payload.generalNotes?.trim()) {
      lines.push('', `*Notas:* ${payload.generalNotes.trim()}`);
    }

    lines.push(
      '',
      `Quedo pendiente para confirmar el total y realizar el anticipo del ${deposit}%.`
    );

    return this.openChat(lines.join('\n'));
  }

  /** Construye la URL `https://wa.me/<numero>?text=...` con UTF-8 completo (tildes, ñ, saltos) */
  buildUrl(message: string): string | null {
    const phone = this.cleanPhone();
    if (phone.length < 10) return null;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  private openChat(message: string): WhatsAppOpenResult {
    const url = this.buildUrl(message);
    if (!url) {
      return { ok: false, reason: 'MISSING_NUMBER' };
    }
    const opened = this.platform.openExternalUrl(url, '_blank');
    if (!opened) {
      return { ok: false, reason: 'SSR_ENVIRONMENT' };
    }
    return { ok: true, url };
  }
}
