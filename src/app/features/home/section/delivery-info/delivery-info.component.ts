import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { AnimateOnScroll } from 'primeng/animateonscroll';
import { SettingsService } from '../../../../core/settings';
import { WhatsappService } from '../../../../core/whatsapp';
import { DeliveryPaymentFeature } from '../../../../shared/contracts';

@Component({
  selector: 'app-delivery-info',
  standalone: true,
  imports: [CommonModule, AnimateOnScroll],
  templateUrl: './delivery-info.component.html',
  styleUrl: './delivery-info.component.scss',
})
export class DeliveryInfoComponent {
  protected readonly settingsService = inject(SettingsService);
  private readonly whatsapp = inject(WhatsappService);

  readonly settings = this.settingsService.settings;

  readonly features = computed<DeliveryPaymentFeature[]>(() => [
    {
      id: 'anticipo',
      icon: 'pi pi-shield',
      title: `Anticipo del ${this.settingsService.depositPercentage()}%`,
      description: `Para pedidos por encargo de Shein solo abonas el ${this.settingsService.depositPercentage()}%. El monto restante lo completas cuando tu paquete llegue a Baní.`,
      badge: 'Cero riesgo',
      highlight: `Llegada estimada en ${this.settingsService.sheinDaysRange()}`,
    },
    {
      id: 'pagos',
      icon: 'pi pi-wallet',
      title: 'Efectivo y Transferencias RD$',
      description:
        'Pagas en moneda local sin requerir tarjeta de crédito internacional. Aceptamos transferencias de Banreservas, Banco Popular, BHD y efectivo al retirar.',
      badge: 'Bancos dominicanos',
      highlight: 'Sin cargos por conversión',
    },
    {
      id: 'retiro',
      icon: 'pi pi-shop',
      title: 'Retiro en Tienda en Baní',
      description: `Visítanos en nuestro local físico en ${this.settings().address}. Puedes probártelo antes de llevarlo o retirar tus paquetes de Shein sin costo.`,
      badge: 'Local físico',
      highlight: 'Horario: 9:00 a.m. a 5:00 p.m.',
    },
    {
      id: 'envio',
      icon: 'pi pi-truck',
      title: 'Envíos a Domicilio en Baní',
      description:
        '¿Prefieres recibirlo en casa o en el trabajo? Coordinamos entrega a domicilio local para tu mayor comodidad.',
      badge: 'Entrega local',
      highlight: 'Prendas en stock el mismo día',
    },
  ]);

  onConsultPayment(): void {
    this.whatsapp.openGeneralInquiry(
      '¡Hola HillyStore! Me gustaría consultar los números de cuenta para transferencias y detalles de entregas en Baní.'
    );
  }
}
