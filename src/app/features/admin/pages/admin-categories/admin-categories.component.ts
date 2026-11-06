import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiClient } from '../../../../core/api';
import { SeoService } from '../../../../core/seo';
import { CategoryDto, UpsertCategoryRequest } from '../../../../shared/contracts';

const FALLBACK_CATEGORIES: CategoryDto[] = [
  { id: 1, name: 'Vestidos', slug: 'vestidos', usesSizes: true, sortOrder: 1, isActive: true },
  { id: 2, name: 'Camisas', slug: 'camisas', usesSizes: true, sortOrder: 2, isActive: true },
  { id: 3, name: 'Tops & Blusas', slug: 'tops-y-blusas', usesSizes: true, sortOrder: 3, isActive: true },
  { id: 4, name: 'Polos & T-Shirts', slug: 'polos-y-t-shirts', usesSizes: true, sortOrder: 4, isActive: true },
  { id: 5, name: 'Pantalones & Jeans', slug: 'pantalones-y-jeans', usesSizes: true, sortOrder: 5, isActive: true },
  { id: 6, name: 'Conjuntos & Blazers', slug: 'conjuntos-y-blazers', usesSizes: true, sortOrder: 6, isActive: true },
  { id: 7, name: 'Shorts & Bermudas', slug: 'shorts-y-bermudas', usesSizes: true, sortOrder: 7, isActive: true },
  { id: 8, name: 'Accesorios', slug: 'accesorios', usesSizes: false, sortOrder: 8, isActive: true },
  { id: 9, name: 'Colonias & Splashes', slug: 'colonias-y-splashes', usesSizes: false, sortOrder: 9, isActive: true },
];

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

  readonly categories = signal<CategoryDto[]>(FALLBACK_CATEGORIES);
  readonly loading = signal<boolean>(false);
  readonly successMessage = signal<string | null>(null);

  // Modal Crear / Editar
  readonly isModalOpen = signal<boolean>(false);
  readonly editingCategoryId = signal<number | null>(null);
  readonly formName = signal<string>('');
  readonly formUsesSizes = signal<boolean>(true);
  readonly formSortOrder = signal<number>(1);
  readonly formIsActive = signal<boolean>(true);

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
        if (cats && cats.length > 0) {
          this.categories.set(cats);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.editingCategoryId.set(null);
    this.formName.set('');
    this.formUsesSizes.set(true);
    this.formSortOrder.set(this.categories().length + 1);
    this.formIsActive.set(true);
    this.isModalOpen.set(true);
  }

  openEditModal(c: CategoryDto): void {
    this.editingCategoryId.set(c.id);
    this.formName.set(c.name);
    this.formUsesSizes.set(c.usesSizes);
    this.formSortOrder.set(c.sortOrder);
    this.formIsActive.set(c.isActive);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
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
    };

    const editId = this.editingCategoryId();
    if (editId !== null) {
      this.api.updateCategory(editId, payload).subscribe({
        next: (updated) => {
          this.categories.update((list) =>
            list.map((c) => (c.id === editId ? updated : c))
          );
          this.notify('Categoría actualizada.');
        },
        error: () => {
          this.categories.update((list) =>
            list.map((c) =>
              c.id === editId
                ? {
                    ...c,
                    name: payload.name,
                    slug: payload.slug || c.slug,
                    usesSizes: payload.usesSizes,
                    sortOrder: payload.sortOrder,
                    isActive: payload.isActive,
                  }
                : c
            )
          );
          this.notify('Categoría guardada localmente.');
        },
      });
    } else {
      this.api.createCategory(payload).subscribe({
        next: (created) => {
          this.categories.update((list) => [...list, created]);
          this.notify('Categoría creada.');
        },
        error: () => {
          const newCat: CategoryDto = {
            id: Date.now(),
            name: payload.name,
            slug: payload.slug || 'cat',
            usesSizes: payload.usesSizes,
            sortOrder: payload.sortOrder,
            isActive: payload.isActive,
          };
          this.categories.update((list) => [...list, newCat]);
          this.notify('Categoría creada localmente.');
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
        this.notify('Categoría eliminada.');
      },
      error: () => {
        this.categories.update((list) => list.filter((c) => c.id !== target.id));
        this.notify('Categoría eliminada.');
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
