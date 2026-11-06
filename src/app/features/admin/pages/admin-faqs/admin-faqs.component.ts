import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiClient } from '../../../../core/api';
import { SeoService } from '../../../../core/seo';
import { FaqDto, UpsertFaqRequest } from '../../../../shared/contracts';

const FALLBACK_FAQS: FaqDto[] = [
  {
    id: 1,
    question: '¿Cómo funciona el pedido por encargo de Shein?',
    answer:
      'Nos envías el enlace o código de las prendas por WhatsApp. Te cotizamos en pesos dominicanos (RD$). Pagas el 50% de anticipo por transferencia bancaria (Banreservas, Popular o BHD) y el 50% restante cuando tu paquete llegue a Baní en 15 a 20 días.',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 2,
    question: '¿Tienen tienda física donde pueda medirme la ropa?',
    answer:
      '¡Sí! Nuestro local está ubicado en Calle 0001, El Llano, Baní, República Dominicana. Abrimos de lunes a sábado de 9:00 a.m. a 5:00 p.m. Contamos con probador.',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 3,
    question: '¿Qué métodos de pago aceptan?',
    answer:
      'Aceptamos transferencias bancarias locales a cuentas de Banreservas, Banco Popular Dominicano y Banco BHD, así como pago en efectivo al retirar en tienda.',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 4,
    question: '¿Hacen envíos a domicilio dentro de Baní?',
    answer:
      'Sí, coordinamos entregas locales seguras en el casco urbano de Baní y zonas aledañas una vez que tu pedido o prenda esté lista.',
    sortOrder: 4,
    isActive: true,
  },
];

@Component({
  selector: 'app-admin-faqs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-faqs.component.html',
  styleUrl: './admin-faqs.component.scss',
})
export class AdminFaqsComponent implements OnInit {
  private readonly api = inject(ApiClient);
  private readonly seo = inject(SeoService);

  readonly faqs = signal<FaqDto[]>(FALLBACK_FAQS);
  readonly loading = signal<boolean>(false);
  readonly successMessage = signal<string | null>(null);

  // Modal Crear / Editar
  readonly isModalOpen = signal<boolean>(false);
  readonly editingFaqId = signal<number | null>(null);
  readonly formQuestion = signal<string>('');
  readonly formAnswer = signal<string>('');
  readonly formSortOrder = signal<number>(1);
  readonly formIsActive = signal<boolean>(true);

  // Modal Borrar
  readonly isDeleteModalOpen = signal<boolean>(false);
  readonly faqToDelete = signal<FaqDto | null>(null);

  ngOnInit(): void {
    this.seo.setPageSeo({
      title: 'Preguntas Frecuentes · Panel Admin | HillyStore',
      description: 'Gestión de preguntas frecuentes (FAQ) para HillyStore Baní.',
      canonicalPath: '/admin/faqs',
    });
    this.loadFaqs();
  }

  loadFaqs(): void {
    this.loading.set(true);
    this.api.getAdminFaqs().subscribe({
      next: (res) => {
        if (res && res.length > 0) {
          this.faqs.set(res);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.editingFaqId.set(null);
    this.formQuestion.set('');
    this.formAnswer.set('');
    this.formSortOrder.set(this.faqs().length + 1);
    this.formIsActive.set(true);
    this.isModalOpen.set(true);
  }

  openEditModal(faq: FaqDto): void {
    this.editingFaqId.set(faq.id);
    this.formQuestion.set(faq.question);
    this.formAnswer.set(faq.answer);
    this.formSortOrder.set(faq.sortOrder);
    this.formIsActive.set(faq.isActive);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveFaq(): void {
    const question = this.formQuestion().trim();
    const answer = this.formAnswer().trim();
    if (!question || !answer) return;

    const payload: UpsertFaqRequest = {
      question,
      answer,
      sortOrder: this.formSortOrder(),
      isActive: this.formIsActive(),
    };

    const editId = this.editingFaqId();
    if (editId !== null) {
      this.api.updateFaq(editId, payload).subscribe({
        next: (updated) => {
          this.faqs.update((list) =>
            list.map((f) => (f.id === editId ? updated : f))
          );
          this.notify('Pregunta actualizada.');
        },
        error: () => {
          this.faqs.update((list) =>
            list.map((f) =>
              f.id === editId
                ? {
                    ...f,
                    question: payload.question,
                    answer: payload.answer,
                    sortOrder: payload.sortOrder,
                    isActive: payload.isActive,
                  }
                : f
            )
          );
          this.notify('Pregunta guardada localmente.');
        },
      });
    } else {
      this.api.createFaq(payload).subscribe({
        next: (created) => {
          this.faqs.update((list) => [...list, created]);
          this.notify('Pregunta creada.');
        },
        error: () => {
          const newFaq: FaqDto = {
            id: Date.now(),
            question: payload.question,
            answer: payload.answer,
            sortOrder: payload.sortOrder,
            isActive: payload.isActive,
          };
          this.faqs.update((list) => [...list, newFaq]);
          this.notify('Pregunta creada localmente.');
        },
      });
    }

    this.closeModal();
  }

  confirmDelete(faq: FaqDto): void {
    this.faqToDelete.set(faq);
    this.isDeleteModalOpen.set(true);
  }

  cancelDelete(): void {
    this.faqToDelete.set(null);
    this.isDeleteModalOpen.set(false);
  }

  deleteFaq(): void {
    const target = this.faqToDelete();
    if (!target) return;

    this.api.deleteFaq(target.id).subscribe({
      next: () => {
        this.faqs.update((list) => list.filter((f) => f.id !== target.id));
        this.notify('Pregunta eliminada.');
      },
      error: () => {
        this.faqs.update((list) => list.filter((f) => f.id !== target.id));
        this.notify('Pregunta eliminada.');
      },
    });

    this.cancelDelete();
  }

  private notify(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => {
      this.successMessage.set(null);
    }, 4000);
  }
}
