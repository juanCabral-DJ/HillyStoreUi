import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnimateOnScroll } from 'primeng/animateonscroll';
import { SettingsService, WhatsappService } from '../../../../core';

@Component({
  selector: 'app-shein-steps',
  standalone: true,
  imports: [RouterLink, AnimateOnScroll],
  templateUrl: './shein-steps.component.html',
  styleUrl: './shein-steps.component.scss',
})
export class SheinStepsComponent {
  protected readonly settingsService = inject(SettingsService);
  protected readonly settings = this.settingsService.settings;
  private readonly whatsapp = inject(WhatsappService);

  protected readonly steps = [
    {
      num: '01',
      title: 'Elige en Shein',
      desc: 'Entra a la web o app de Shein, busca la ropa o accesorios que te gusten y copia sus enlaces con tus tallas.',
      icon: '👗',
    },
    {
      num: '02',
      title: 'Envíanos tus links',
      desc: 'Pega tus enlaces en nuestro formulario o envíalos directo a nuestro WhatsApp para cotizarte en pesos dominicanos (RD$).',
      icon: '💬',
    },
    {
      num: '03',
      title: 'Reserva con el 50%',
      desc: 'Pagas la mitad del pedido por transferencia o en efectivo en nuestro local de Baní y de inmediato ordenamos tu paquete.',
      icon: '💳',
    },
    {
      num: '04',
      title: 'Recibe y paga el resto',
      desc: 'Tu pedido llega a Baní en el plazo acordado. Pagas el 50% restante al retirar en tienda o al recibirlo en tu puerta.',
      icon: '📦',
    },
  ];

  protected onConsultWhatsApp(): void {
    this.whatsapp.openGeneralInquiry('¡Hola HillyStore! Tengo una duda sobre cómo hacer pedidos por encargo de Shein.');
  }
}
