import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionPanel,
} from 'primeng/accordion';
import { AnimateOnScroll } from 'primeng/animateonscroll';
import { ApiClient } from '../../../../core/api';
import { SettingsService } from '../../../../core/settings';
import { WhatsappService } from '../../../../core/whatsapp';
import { FaqDto } from '../../../../shared/contracts';

@Component({
  selector: 'app-faq-accordion',
  standalone: true,
  imports: [
    CommonModule,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    AnimateOnScroll,
  ],
  templateUrl: './faq-accordion.component.html',
  styleUrl: './faq-accordion.component.scss',
})
export class FaqAccordionComponent implements OnInit {
  private readonly api = inject(ApiClient);
  private readonly whatsapp = inject(WhatsappService);
  protected readonly settingsService = inject(SettingsService);

  readonly faqs = signal<FaqDto[]>([]);
  readonly activeValue = signal<string>('0');
  readonly loading = signal<boolean>(true);

  ngOnInit(): void {
    this.fetchFaqs();
  }

  fetchFaqs(): void {
    this.loading.set(true);
    this.api.getFaqs().subscribe({
      next: (items) => {
        if (items && items.length > 0) {
          this.faqs.set(items.filter((f) => f.isActive).sort((a, b) => a.sortOrder - b.sortOrder));
        } else {
          this.faqs.set(this.getFallbackFaqs());
        }
        this.loading.set(false);
      },
      error: () => {
        this.faqs.set(this.getFallbackFaqs());
        this.loading.set(false);
      },
    });
  }

  onAskCustomQuestion(): void {
    this.whatsapp.openGeneralInquiry(
      '¡Hola HillyStore! Tengo una pregunta sobre sus prendas y pedidos que me gustaría consultar.'
    );
  }

  private getFallbackFaqs(): FaqDto[] {
    const deposit = this.settingsService.depositPercentage();
    const range = this.settingsService.sheinDaysRange();

    return [
      {
        id: 1,
        question: '¿Cómo realizo un pedido de Shein si no tengo tarjeta internacional ni casillero?',
        answer: `Es muy fácil: buscas las prendas que te gusten en Shein y nos envías los enlaces o capturas por WhatsApp indicando tu talla. Te cotizamos el total en pesos dominicanos (RD$) y abonas el ${deposit}% de anticipo por transferencia bancaria (Banreservas, Popular, BHD) o en efectivo en nuestra tienda. El restante ${100 - deposit}% lo completas cuando tu paquete llegue a Baní.`,
        sortOrder: 1,
        isActive: true,
      },
      {
        id: 2,
        question: '¿Cuánto tiempo tarda en llegar mi pedido de Shein a Baní?',
        answer: `El tiempo estimado de entrega es de ${range} a partir de la confirmación de tu anticipo. Te mantenemos al tanto del estado del paquete y te avisamos tan pronto esté listo para que pases a retirarlo o coordinar tu envío local.`,
        sortOrder: 2,
        isActive: true,
      },
      {
        id: 3,
        question: '¿Puedo medirme la ropa en stock antes de comprar?',
        answer:
          '¡Claro que sí! Todas las prendas marcadas como "En Stock" están físicamente en nuestra tienda en Baní. Puedes visitarnos de lunes a sábado de 9:00 a.m. a 5:00 p.m. para probártelas, comprobar la calidad y llevarte tu prenda al instante.',
        sortOrder: 3,
        isActive: true,
      },
      {
        id: 4,
        question: '¿Cuáles son los métodos de pago aceptados?',
        answer:
          'Aceptamos transferencias bancarias en moneda nacional (RD$) a través de Banco Popular Dominicano, Banreservas y Banco BHD. Si retiras en tienda o solicitas envío local contra entrega, también puedes pagar en efectivo.',
        sortOrder: 4,
        isActive: true,
      },
      {
        id: 5,
        question: '¿Realizan envíos a domicilio en Baní?',
        answer:
          'Sí, contamos con servicio de mensajería local en la zona urbana de Baní. Para prendas en stock el envío se realiza el mismo día o al día siguiente. Para pedidos de Shein, una vez llega el paquete, coordinamos la entrega en tu casa o lugar de trabajo.',
        sortOrder: 5,
        isActive: true,
      },
      {
        id: 6,
        question: '¿Cómo funcionan los cambios de prendas en stock?',
        answer:
          'Para prendas adquiridas de nuestro stock físico, aceptamos cambios de talla dentro de las 48 horas posteriores a la compra, presentando la prenda en perfecto estado y con sus etiquetas originales. En pedidos por encargo de Shein, te asesoramos previamente con la tabla de medidas antes de confirmar la orden.',
        sortOrder: 6,
        isActive: true,
      },
    ];
  }
}
