import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiClient } from '../../../../core/api';
import { SeoService } from '../../../../core/seo';
import {
  AdminProductDto,
  Audience,
  CategoryDto,
  CreateProductRequest,
  UpsertProductSizeInput,
} from '../../../../shared/contracts';

const DEFAULT_SIZES: string[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34'];

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss',
})
export class AdminProductsComponent implements OnInit {
  private readonly api = inject(ApiClient);
  private readonly seo = inject(SeoService);

  readonly products = signal<AdminProductDto[]>([]);
  readonly categories = signal<CategoryDto[]>([]);
  readonly loading = signal<boolean>(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  // Filtros
  readonly searchFilter = signal<string>('');
  readonly audienceFilter = signal<'Todas' | Audience>('Todas');
  readonly availabilityFilter = signal<'Todas' | 'Disponibles' | 'Agotadas'>('Todas');

  // Modal Crear / Editar
  readonly isModalOpen = signal<boolean>(false);
  readonly editingProductId = signal<number | null>(null);
  readonly formName = signal<string>('');
  readonly formDescription = signal<string>('');
  readonly formPrice = signal<number>(1500);
  readonly formAudience = signal<Audience>('Mujeres');
  readonly formCategoryId = signal<number>(1);
  readonly formIsAvailable = signal<boolean>(true);
  readonly formIsFeatured = signal<boolean>(false);
  readonly formImageUrl = signal<string>('');
  readonly formSizes = signal<UpsertProductSizeInput[]>([]);
  readonly selectedFile = signal<File | null>(null);
  readonly previewImageUrl = signal<string>('');
  readonly isUploading = signal<boolean>(false);

  // Tallas disponibles para selección
  readonly standardSizes = DEFAULT_SIZES;

  readonly categoryUsesSizes = computed(() => {
    const catId = Number(this.formCategoryId());
    const cat = this.categories().find((c) => c.id === catId);
    return cat ? cat.usesSizes : true;
  });

  // Modal Confirmar Borrado
  readonly isDeleteConfirmOpen = signal<boolean>(false);
  readonly productToDelete = signal<AdminProductDto | null>(null);

  ngOnInit(): void {
    this.seo.setPageSeo({
      title: 'Gestión de Prendas · Panel Admin | HillyStore',
      description: 'Administración de inventario y prendas de HillyStore Baní.',
      canonicalPath: '/admin/productos',
    });
    this.loadCategories();
    this.loadProducts();
  }

  getSizeLabels(p: AdminProductDto): string {
    return p.sizes && p.sizes.length > 0 ? p.sizes.map((s) => s.label).join(', ') : 'Talla única';
  }

  loadProducts(): void {
    this.loading.set(true);
    this.api.getAdminProducts().subscribe({
      next: (res) => {
        if (res && res.items && res.items.length > 0) {
          this.products.set(res.items);
        }
        this.loading.set(false);
      },
      error: () => {
        // Mantiene la lista local si el backend no responde
        this.loading.set(false);
      },
    });
  }

  loadCategories(): void {
    this.api.getAdminCategories().subscribe({
      next: (cats) => {
        if (cats && cats.length > 0) {
          this.categories.set(cats);
        }
      },
      error: () => {
        this.categories.set([
          { id: 1, name: 'Vestidos', slug: 'vestidos', usesSizes: true, sortOrder: 1, isActive: true },
          { id: 2, name: 'Camisas', slug: 'camisas', usesSizes: true, sortOrder: 2, isActive: true },
          { id: 3, name: 'Tops & Blusas', slug: 'tops-y-blusas', usesSizes: true, sortOrder: 3, isActive: true },
          { id: 4, name: 'Polos & T-Shirts', slug: 'polos-y-t-shirts', usesSizes: true, sortOrder: 4, isActive: true },
          { id: 5, name: 'Pantalones & Jeans', slug: 'pantalones-y-jeans', usesSizes: true, sortOrder: 5, isActive: true },
        ]);
      },
    });
  }

  filteredProducts(): AdminProductDto[] {
    const search = this.searchFilter().trim().toLowerCase();
    const aud = this.audienceFilter();
    const avail = this.availabilityFilter();

    return this.products().filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search) || p.slug.toLowerCase().includes(search);
      const matchAudience = aud === 'Todas' || p.audience === aud;
      const matchAvail =
        avail === 'Todas' ||
        (avail === 'Disponibles' && p.isAvailable) ||
        (avail === 'Agotadas' && !p.isAvailable);

      return matchSearch && matchAudience && matchAvail;
    });
  }

  openCreateModal(): void {
    this.editingProductId.set(null);
    this.formName.set('');
    this.formDescription.set('');
    this.formPrice.set(1500);
    this.formAudience.set('Mujeres');
    const firstCatObj = this.categories()[0];
    const firstCat = firstCatObj?.id ?? 1;
    this.formCategoryId.set(firstCat);
    this.formIsAvailable.set(true);
    this.formIsFeatured.set(false);
    this.formImageUrl.set('');
    this.selectedFile.set(null);
    this.previewImageUrl.set('');

    if (firstCatObj && !firstCatObj.usesSizes) {
      this.formSizes.set([]);
    } else {
      this.formSizes.set([
        { label: 'S', inStock: true },
        { label: 'M', inStock: true },
        { label: 'L', inStock: true },
      ]);
    }
    this.isModalOpen.set(true);
  }

  openEditModal(p: AdminProductDto): void {
    this.editingProductId.set(p.id);
    this.formName.set(p.name);
    this.formDescription.set(p.description || '');
    this.formPrice.set(p.price);
    this.formAudience.set(p.audience);
    this.formCategoryId.set(p.categoryId);
    this.formIsAvailable.set(p.isAvailable);
    this.formIsFeatured.set(p.isFeatured);

    const initialImg = p.images && p.images[0]?.url ? p.images[0].url : ((p as any).primaryImageUrl || '');
    this.formImageUrl.set(initialImg);
    this.previewImageUrl.set(initialImg);
    this.selectedFile.set(null);

    const cat = this.categories().find((c) => c.id === p.categoryId);
    const usesSizes = cat ? cat.usesSizes : ((p as any).usesSizes ?? true);

    if (!usesSizes) {
      this.formSizes.set([]);
    } else {
      const sizes = (p.sizes || []).map((s) => ({ label: s.label, inStock: s.inStock }));
      if (sizes.length === 0 && (p as any).availableSizes) {
        const avail = ((p as any).availableSizes as string[]) || [];
        avail.forEach((lbl) => sizes.push({ label: lbl, inStock: true }));
      }
      this.formSizes.set(sizes);
    }
    this.isModalOpen.set(true);

    // Obtener detalles completos de la prenda desde el backend (por si la lista resumida no trajo todas las tallas o fotos)
    this.api.getAdminProductById(p.id).subscribe({
      next: (full) => {
        if (full && this.editingProductId() === p.id) {
          this.formName.set(full.name);
          this.formDescription.set(full.description || '');
          this.formPrice.set(full.price);
          this.formAudience.set(full.audience);
          this.formCategoryId.set(full.categoryId);
          this.formIsAvailable.set(full.isAvailable);
          this.formIsFeatured.set(full.isFeatured);
          if (full.images && full.images.length > 0 && !this.selectedFile()) {
            this.formImageUrl.set(full.images[0].url);
            this.previewImageUrl.set(full.images[0].url);
          }
          const fullCat = this.categories().find((c) => c.id === full.categoryId);
          const fullUsesSizes = fullCat ? fullCat.usesSizes : (full.usesSizes ?? true);
          if (!fullUsesSizes) {
            this.formSizes.set([]);
          } else if (full.sizes && full.sizes.length > 0) {
            this.formSizes.set(full.sizes.map((s) => ({ label: s.label, inStock: s.inStock })));
          }
        }
      },
      error: () => {
        // En caso de fallo de red, se mantienen los valores ya cargados desde la fila
      },
    });
  }

  onCategoryChange(catId: any): void {
    const id = Number(catId);
    this.formCategoryId.set(id);
    const cat = this.categories().find((c) => c.id === id);
    if (cat && !cat.usesSizes) {
      this.formSizes.set([]);
    } else if (this.formSizes().length === 0) {
      this.formSizes.set([
        { label: 'S', inStock: true },
        { label: 'M', inStock: true },
        { label: 'L', inStock: true },
      ]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.notify('La foto no debe superar los 5 MB.');
        return;
      }
      this.selectedFile.set(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImageUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  clearSelectedFile(): void {
    this.selectedFile.set(null);
    this.previewImageUrl.set('');
    this.formImageUrl.set('');
  }

  toggleModalAvailability(): void {
    this.formIsAvailable.update((v) => !v);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  toggleSize(sizeLabel: string): void {
    const current = this.formSizes();
    const existing = current.find((s) => s.label === sizeLabel);
    if (existing) {
      this.formSizes.set(current.filter((s) => s.label !== sizeLabel));
    } else {
      this.formSizes.set([...current, { label: sizeLabel, inStock: true }]);
    }
  }

  isSizeSelected(sizeLabel: string): boolean {
    return this.formSizes().some((s) => s.label === sizeLabel);
  }

  toggleSizeStock(sizeLabel: string): void {
    this.formSizes.update((list) =>
      list.map((s) => (s.label === sizeLabel ? { ...s, inStock: !s.inStock } : s))
    );
  }

  saveProduct(): void {
    const name = this.formName().trim();
    if (!name) return;

    const usesSizes = this.categoryUsesSizes();
    const payload: CreateProductRequest = {
      name,
      description: this.formDescription().trim() || null,
      price: this.formPrice(),
      audience: this.formAudience(),
      categoryId: Number(this.formCategoryId()),
      isAvailable: this.formIsAvailable(),
      isFeatured: this.formIsFeatured(),
      sizes: usesSizes ? this.formSizes() : [],
    };

    const editId = this.editingProductId();
    const fileToUpload = this.selectedFile();
    const cat = this.categories().find((c) => c.id === payload.categoryId);
    const catName = cat?.name ?? 'General';
    const catSlug = cat?.slug ?? 'general';

    if (editId !== null) {
      // Update
      this.api.updateProduct(editId, payload).subscribe({
        next: (updated) => {
          if (fileToUpload) {
            this.uploadAndAttachImage(editId, fileToUpload);
          }
          this.products.update((list) =>
            list.map((item) => (item.id === editId ? updated : item))
          );
          this.notify('Prenda actualizada correctamente en el servidor.');
        },
        error: (err) => {
          this.notify(
            err?.error?.message || 'Error al actualizar prenda en el servidor. Verifica el backend.',
            true
          );
        },
      });
    } else {
      // Create
      this.api.createProduct(payload).subscribe({
        next: (created) => {
          if (fileToUpload) {
            this.uploadAndAttachImage(created.id, fileToUpload);
          }
          this.products.update((list) => [created, ...list]);
          this.notify('Prenda creada con éxito en el servidor.');
        },
        error: (err) => {
          this.notify(
            err?.error?.message || 'Error al crear la prenda en el servidor. Verifica el backend.',
            true
          );
        },
      });
    }

    this.closeModal();
  }

  private uploadAndAttachImage(productId: number, file: File): void {
    this.isUploading.set(true);
    this.api.uploadProductImage(productId, file, { isPrimary: true }).subscribe({
      next: (imgDto) => {
        this.products.update((list) =>
          list.map((p) => {
            if (p.id === productId) {
              const otherImages = (p.images || []).map((img) => ({ ...img, isPrimary: false }));
              return {
                ...p,
                images: [imgDto, ...otherImages],
                primaryImageUrl: imgDto.url,
              };
            }
            return p;
          })
        );
        this.isUploading.set(false);
        this.notify('Foto subida y optimizada exitosamente en el servidor.');
      },
      error: () => {
        this.isUploading.set(false);
        this.notify('Aviso: La prenda se guardó pero ocurrió un problema al subir la foto.');
      },
    });
  }

  toggleAvailability(p: AdminProductDto): void {
    const nextVal = !p.isAvailable;
    this.api.setProductAvailability(p.id, nextVal).subscribe({
      next: () => {
        this.products.update((list) =>
          list.map((item) => (item.id === p.id ? { ...item, isAvailable: nextVal } : item))
        );
      },
      error: (err) => {
        this.notify(
          err?.error?.message || 'Error al actualizar disponibilidad en el servidor.',
          true
        );
      },
    });
  }

  confirmDelete(p: AdminProductDto): void {
    this.productToDelete.set(p);
    this.isDeleteConfirmOpen.set(true);
  }

  cancelDelete(): void {
    this.productToDelete.set(null);
    this.isDeleteConfirmOpen.set(false);
  }

  deleteProduct(): void {
    const target = this.productToDelete();
    if (!target) return;

    this.api.deleteProduct(target.id).subscribe({
      next: () => {
        this.products.update((list) => list.filter((item) => item.id !== target.id));
        this.notify('Prenda eliminada correctamente.');
      },
      error: (err) => {
        this.notify(
          err?.error?.message || 'Error al eliminar prenda en el servidor. Verifica el backend.',
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
