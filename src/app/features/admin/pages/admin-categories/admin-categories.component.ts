import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiClient } from '../../../../core/api';
import { SeoService } from '../../../../core/seo';
import { CategoryDto, UpsertCategoryRequest } from '../../../../shared/contracts';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.scss',
})
export class AdminCategoriesComponent implements OnInit {
  private readonly api = inject(ApiClient);
  private readonly seo = inject(SeoService);

  readonly categories = signal<CategoryDto[]>([]);
  readonly loading = signal<boolean>(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  // Modal Crear / Editar
  readonly isModalOpen = signal<boolean>(false);
  readonly editingCategoryId = signal<number | null>(null);
  readonly formName = signal<string>('');
  readonly formImageUrl = signal<string | null>(null);
  readonly imagePreview = signal<string | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly formUsesSizes = signal<boolean>(true);
  readonly formSortOrder = signal<number>(1);
  readonly formIsActive = signal<boolean>(true);
  readonly isUploading = signal<boolean>(false);

  // Modal Borrar
  readonly isDeleteModalOpen = signal<boolean>(false);
  readonly categoryToDelete = signal<CategoryDto | null>(null);

  ngOnInit(): void {
    this.seo.setPageSeo({
      title: 'Gestión de Categorías · Panel Admin | HillyStore',
      description: 'Administración de categorías de prendas de HillyStore Baní.',
      canonicalPath: '/admin/categorias',
    });
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.api.getAdminCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats || []);
        this.loading.set(false);
      },
      error: () => {
        this.categories.set([]);
        this.loading.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.editingCategoryId.set(null);
    this.formName.set('');
    this.formImageUrl.set(null);
    this.imagePreview.set(null);
    this.selectedFile.set(null);
    this.formUsesSizes.set(true);
    this.formSortOrder.set(this.categories().length + 1);
    this.formIsActive.set(true);
    this.isModalOpen.set(true);
  }

  openEditModal(c: CategoryDto): void {
    this.editingCategoryId.set(c.id);
    this.formName.set(c.name);
    this.formImageUrl.set(c.imageUrl || null);
    this.imagePreview.set(c.imageUrl || null);
    this.selectedFile.set(null);
    this.formUsesSizes.set(c.usesSizes);
    this.formSortOrder.set(c.sortOrder);
    this.formIsActive.set(c.isActive);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedFile.set(null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile.set(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile.set(null);
    this.imagePreview.set(null);
    this.formImageUrl.set(null);
  }

  saveCategory(): void {
    const name = this.formName().trim();
    if (!name) return;

    const payload: UpsertCategoryRequest = {
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      usesSizes: this.formUsesSizes(),
      sortOrder: this.formSortOrder(),
      isActive: this.formIsActive(),
      imageUrl: this.formImageUrl(),
    };

    const editId = this.editingCategoryId();
    const fileToUpload = this.selectedFile();

    if (editId !== null) {
      this.isUploading.set(true);
      this.api.updateCategory(editId, payload).subscribe({
        next: (updated) => {
          if (fileToUpload) {
            this.api.uploadCategoryImage(editId, fileToUpload).subscribe({
              next: (withImage) => {
                this.categories.update((list) =>
                  list.map((c) => (c.id === editId ? withImage : c))
                );
                this.isUploading.set(false);
                this.notify('Categoría y foto actualizadas.');
              },
              error: () => {
                this.categories.update((list) =>
                  list.map((c) => (c.id === editId ? updated : c))
                );
                this.isUploading.set(false);
                this.notify('Categoría actualizada (error al subir foto).');
              },
            });
          } else {
            this.categories.update((list) =>
              list.map((c) => (c.id === editId ? updated : c))
            );
            this.isUploading.set(false);
            this.notify('Categoría actualizada.');
          }
        },
        error: (err) => {
          this.isUploading.set(false);
          this.notify(
            err?.error?.message || 'Error al actualizar categoría en el servidor. Verifica el backend.',
            true
          );
        },
      });
    } else {
      this.isUploading.set(true);
      this.api.createCategory(payload).subscribe({
        next: (created) => {
          if (fileToUpload) {
            this.api.uploadCategoryImage(created.id, fileToUpload).subscribe({
              next: (withImage) => {
                this.categories.update((list) => [...list, withImage]);
                this.isUploading.set(false);
                this.notify('Categoría creada con foto.');
              },
              error: () => {
                this.categories.update((list) => [...list, created]);
                this.isUploading.set(false);
                this.notify('Categoría creada (error al subir foto).', true);
              },
            });
          } else {
            this.categories.update((list) => [...list, created]);
            this.isUploading.set(false);
            this.notify('Categoría creada con éxito en el servidor.');
          }
        },
        error: (err) => {
          this.isUploading.set(false);
          this.notify(
            err?.error?.message || 'Error al crear la categoría en el servidor. Verifica el backend.',
            true
          );
        },
      });
    }

    this.closeModal();
  }

  confirmDelete(c: CategoryDto): void {
    this.categoryToDelete.set(c);
    this.isDeleteModalOpen.set(true);
  }

  cancelDelete(): void {
    this.categoryToDelete.set(null);
    this.isDeleteModalOpen.set(false);
  }

  deleteCategory(): void {
    const target = this.categoryToDelete();
    if (!target) return;

    this.api.deleteCategory(target.id).subscribe({
      next: () => {
        this.categories.update((list) => list.filter((c) => c.id !== target.id));
        this.notify('Categoría eliminada correctamente.');
      },
      error: (err) => {
        this.notify(
          err?.error?.message || 'Error al eliminar categoría en el servidor. Verifica el backend.',
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
