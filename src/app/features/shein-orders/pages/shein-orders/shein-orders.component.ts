import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnimateOnScroll } from 'primeng/animateonscroll';
import { SeoService } from '../../../../core/seo';
import { SettingsService } from '../../../../core/settings';
import { WhatsappService } from '../../../../core/whatsapp';
import { SheinFormItem } from '../../../../shared/contracts';

@Component({
  selector: 'app-shein-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, AnimateOnScroll],
  templateUrl: './shein-orders.component.html',
  styleUrl: './shein-orders.component.scss',
})
export class SheinOrdersComponent implements OnInit {
  private readonly whatsapp = inject(WhatsappService);
  protected readonly settingsService = inject(SettingsService);
  private readonly seo = inject(SeoService);

  // Formulario único para ingresar una prenda
  readonly currentLink = signal<string>('');
  readonly currentSize = signal<string>('S');
  readonly currentNotes = signal<string>('');
  readonly inputError = signal<string | null>(null);
  readonly itemAddedNotice = signal<string | null>(null);

  // Lista acumulada de prendas agregadas
  readonly items = signal<SheinFormItem[]>([]);

  // Datos del cliente y notas generales
  readonly customerName = signal<string>('');
  readonly generalNotes = signal<string>('');
  readonly submitted = signal<boolean>(false);
  readonly orderError = signal<string | null>(null);

  readonly availableSizes: string[] = [
    'XS',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    '30',
    '32',
    '34',
    'Única / Otra',
  ];

  ngOnInit(): void {
    this.seo.setPageSeo({
      title: 'Pedidos por Encargo de Shein a Baní (50% Anticipo) | HillyStore',
      description:
        'Pide ropa y accesorios de Shein sin tarjeta internacional ni casillero. Entrega en Baní en 15 a 20 días con solo 50% de anticipo.',
      canonicalPath: '/pedidos-shein',
    });
  }

  addCurrentItem(): void {
    const link = this.currentLink().trim();

    if (!link) {
      this.inputError.set('Por favor pega el enlace o código del producto de Shein.');
      return;
    }

    const newItem: SheinFormItem = {
      id: `shein-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      link,
      size: this.currentSize(),
      notes: this.currentNotes().trim() || undefined,
    };

    this.items.update((curr) => [...curr, newItem]);

    // Resetear formulario para el siguiente artículo
    this.currentLink.set('');
    this.currentSize.set('S');
    this.currentNotes.set('');
    this.inputError.set(null);
    this.orderError.set(null);

    this.itemAddedNotice.set('¡Prenda agregada a tu lista con éxito!');
    setTimeout(() => {
      this.itemAddedNotice.set(null);
    }, 3000);
  }

  removeItem(id: string): void {
    this.items.update((curr) => curr.filter((item) => item.id !== id));
  }

  clearAllItems(): void {
    this.items.set([]);
  }

  getShortLink(link: string): string {
    try {
      const url = new URL(link);
      const pathname = url.pathname.length > 25 ? url.pathname.slice(0, 22) + '...' : url.pathname;
      return url.hostname.replace('www.', '') + pathname;
    } catch {
      return link.length > 32 ? link.slice(0, 29) + '...' : link;
    }
  }

  onSubmitOrder(): void {
    this.submitted.set(true);
    this.orderError.set(null);

    // Si el usuario escribió un link en el input pero no presionó "Agregar", lo agregamos automáticamente
    const currentLinkValue = this.currentLink().trim();
    if (currentLinkValue) {
      this.addCurrentItem();
    }

    const currentItems = this.items();
    if (currentItems.length === 0) {
      this.orderError.set(
        'Por favor agrega al menos una prenda a tu lista antes de enviar a WhatsApp.'
      );
      return;
    }

    const payload = {
      customerName: this.customerName().trim() || undefined,
      items: currentItems.map((i) => ({
        link: i.link.trim(),
        size: i.size,
        notes: i.notes?.trim() || undefined,
      })),
      generalNotes: this.generalNotes().trim() || undefined,
    };

    const res = this.whatsapp.openSheinOrder(payload);
    if (!res.ok && res.reason === 'MISSING_NUMBER') {
      this.orderError.set(
        'El número de WhatsApp de la tienda aún no está configurado.'
      );
    }
  }

  onAskGeneralInquiry(): void {
    this.whatsapp.openGeneralInquiry(
      '¡Hola HillyStore! Tengo una duda sobre cómo hacer mi pedido de Shein.'
    );
  }
}
