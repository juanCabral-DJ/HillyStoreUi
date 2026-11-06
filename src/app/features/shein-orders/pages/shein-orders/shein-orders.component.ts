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

  readonly customerName = signal<string>('');
  readonly generalNotes = signal<string>('');
  readonly submitted = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly items = signal<SheinFormItem[]>([
    { id: 'item-1', link: '', size: 'S', notes: '' },
  ]);

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

  addItem(): void {
    const newId = `item-${Date.now()}`;
    this.items.update((curr) => [
      ...curr,
      { id: newId, link: '', size: 'S', notes: '' },
    ]);
  }

  removeItem(id: string): void {
    if (this.items().length <= 1) return;
    this.items.update((curr) => curr.filter((item) => item.id !== id));
  }

  onSubmitOrder(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);

    const validItems = this.items().filter((i) => i.link.trim().length > 0);

    if (validItems.length === 0) {
      this.errorMessage.set(
        'Por favor, ingresa al menos un enlace o código de prenda de Shein.'
      );
      return;
    }

    const payload = {
      customerName: this.customerName().trim() || undefined,
      items: validItems.map((i) => ({
        link: i.link.trim(),
        size: i.size,
        notes: i.notes?.trim() || undefined,
      })),
      generalNotes: this.generalNotes().trim() || undefined,
    };

    const res = this.whatsapp.openSheinOrder(payload);
    if (!res.ok && res.reason === 'MISSING_NUMBER') {
      this.errorMessage.set(
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
