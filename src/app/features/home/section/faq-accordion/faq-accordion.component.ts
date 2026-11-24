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
        if (items) {
          this.faqs.set(items.filter((f) => f.isActive).sort((a, b) => a.sortOrder - b.sortOrder));
        } else {
          this.faqs.set([]);
        }
        this.loading.set(false);
      },
      error: () => {
        this.faqs.set([]);
        this.loading.set(false);
      },
    });
  }

  onAskCustomQuestion(): void {
    this.whatsapp.openGeneralInquiry(
      '¡Hola HillyStore! Tengo una pregunta sobre sus prendas y pedidos que me gustaría consultar.'
    );
  }
}

