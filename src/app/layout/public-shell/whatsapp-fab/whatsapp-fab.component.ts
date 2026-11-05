import { Component, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { WhatsappService } from '../../../core';
import { Button, ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-whatsapp-fab',
  standalone: true,
  templateUrl: './whatsapp-fab.component.html',
  styleUrl: './whatsapp-fab.component.scss',
  imports: [ButtonDirective],
})
export class WhatsappFabComponent {
  protected readonly whatsapp = inject(WhatsappService);
  private readonly toast = inject(MessageService);

  protected onOpenWhatsApp(): void {
    const result = this.whatsapp.openGeneralInquiry();
    if (!result.ok && result.reason === 'MISSING_NUMBER') {
      this.toast.add({
        severity: 'warn',
        summary: 'WhatsApp aún no configurado',
        detail:
          'El número de WhatsApp de la tienda todavía no está activo. Configúralo en el panel de administración.',
        life: 4500,
      });
    }
  }
}
