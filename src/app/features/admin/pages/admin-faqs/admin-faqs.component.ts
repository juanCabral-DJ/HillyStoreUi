import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiClient } from '../../../../core/api';
import { SeoService } from '../../../../core/seo';
import { FaqDto, UpsertFaqRequest } from '../../../../shared/contracts';

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

  readonly faqs = signal<FaqDto[]>([]);
  readonly loading = signal<boolean>(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

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
        this.faqs.set(res || []);
        this.loading.set(false);
      },
      error: () => {
        this.faqs.set([]);
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
          this.notify('Pregunta actualizada correctamente.');
        },
        error: (err) => {
          this.notify(
            err?.error?.message || 'Error al actualizar pregunta en el servidor. Verifica el backend.',
            true
          );
        },
      });
    } else {
      this.api.createFaq(payload).subscribe({
        next: (created) => {
          this.faqs.update((list) => [...list, created]);
          this.notify('Pregunta creada con éxito en el servidor.');
        },
        error: (err) => {
          this.notify(
            err?.error?.message || 'Error al crear pregunta en el servidor. Verifica el backend.',
            true
          );
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
      error: (err) => {
        this.notify(
          err?.error?.message || 'Error al eliminar pregunta en el servidor. Verifica el backend.',
          true
        );
      },
    });

    this.cancelDelete();
  }

  private notify(msg: string, isError = false): void {
    if (isError) {
      this.errorMessage.set(msg);
      setTimeout(() => {
        this.errorMessage.set(null);
      }, 5000);
    } else {
      this.successMessage.set(msg);
      setTimeout(() => {
        this.successMessage.set(null);
      }, 4000);
    }
  }
}
