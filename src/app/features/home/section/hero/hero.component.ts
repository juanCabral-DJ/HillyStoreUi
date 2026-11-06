import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnimateOnScroll } from 'primeng/animateonscroll';
import { SettingsService, WhatsappService } from '../../../../core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, AnimateOnScroll, NgOptimizedImage],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  protected readonly settingsService = inject(SettingsService);
  protected readonly settings = this.settingsService.settings;
  private readonly whatsapp = inject(WhatsappService);

  protected onOrderWhatsApp(): void {
    this.whatsapp.openGeneralInquiry('¡Hola HillyStore! Me gustaría hacer un pedido.');
  }
}
