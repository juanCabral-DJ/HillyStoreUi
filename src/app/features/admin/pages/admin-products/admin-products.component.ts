import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
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

const INITIAL_FALLBACK_PRODUCTS: AdminProductDto[] = [
  {
    id: 1,
    name: 'Vestido Tropical Floral Maxi',
    slug: 'vestido-tropical-floral-maxi',
    description: 'Vestido fresco ideal para clima caribeño en Baní. Tela suave de alta calidad.',
    price: 1850,
    audience: 'Mujeres',
    isAvailable: true,
    isFeatured: true,
    categoryId: 1,
    categoryName: 'Vestidos',
    categorySlug: 'vestidos',
    usesSizes: true,
    sizes: [
      { id: 1, label: 'S', inStock: true },
      { id: 2, label: 'M', inStock: true },
      { id: 3, label: 'L', inStock: false },
    ],
    images: [{ id: 1, url: '/hero.png', sortOrder: 1, isPrimary: true }],
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 2,
    name: 'Camisa Guayabera Lino Blanco',
    slug: 'camisa-guayabera-lino-blanco',
    description: 'Elegancia clásica y frescura para ocasiones especiales o diario.',
    price: 2200,
    audience: 'Hombres',
    isAvailable: true,
    isFeatured: true,
    categoryId: 2,
    categoryName: 'Camisas',
    categorySlug: 'camisas',
    usesSizes: true,
    sizes: [
      { id: 4, label: 'M', inStock: true },
      { id: 5, label: 'L', inStock: true },
      { id: 6, label: 'XL', inStock: true },
    ],
    images: [{ id: 2, url: '/hero.png', sortOrder: 1, isPrimary: true }],
    createdAt: '2026-11-01T11:00:00Z',
    updatedAt: '2026-11-01T11:00:00Z',
  },
  {
    id: 3,
    name: 'Blusa Satén Escote Elegante',
    slug: 'blusa-saten-escote-elegante',
    description: 'Tacto sedoso con acabado brillante sutil para salidas o eventos.',
    price: 1450,
    audience: 'Mujeres',
    isAvailable: true,
    isFeatured: false,
    categoryId: 3,
    categoryName: 'Tops & Blusas',
    categorySlug: 'tops-y-blusas',
    usesSizes: true,
    sizes: [
      { id: 7, label: 'S', inStock: true },
      { id: 8, label: 'M', inStock: true },
    ],
    images: [{ id: 3, url: '/hero.png', sortOrder: 1, isPrimary: true }],
    createdAt: '2026-11-01T12:00:00Z',
    updatedAt: '2026-11-01T12:00:00Z',
  },
  {
    id: 4,
    name: 'Polo Piqué Clásico Marino',
    slug: 'polo-pique-clasico-marino',
    description: 'Algodón transpirable, corte moderno y cuello estructurado.',
    price: 1600,
    audience: 'Hombres',
    isAvailable: false,
    isFeatured: false,
    categoryId: 4,
    categoryName: 'Polos & T-Shirts',
    categorySlug: 'polos-y-t-shirts',
    usesSizes: true,
    sizes: [
      { id: 9, label: 'M', inStock: false },
      { id: 10, label: 'L', inStock: false },
    ],
    images: [{ id: 4, url: '/hero.png', sortOrder: 1, isPrimary: true }],
    createdAt: '2026-11-01T13:00:00Z',
    updatedAt: '2026-11-01T13:00:00Z',
  },
];

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

  readonly products = signal<AdminProductDto[]>(INITIAL_FALLBACK_PRODUCTS);
  readonly categories = signal<CategoryDto[]>([]);
  readonly loading = signal<boolean>(false);
  readonly successMessage = signal<string | null>(null);

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

  // Tallas disponibles para selección
  readonly standardSizes = DEFAULT_SIZES;

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
    const firstCat = this.categories()[0]?.id ?? 1;
    this.formCategoryId.set(firstCat);
    this.formIsAvailable.set(true);
    this.formIsFeatured.set(false);
    this.formImageUrl.set('');
    this.formSizes.set([
      { label: 'S', inStock: true },
      { label: 'M', inStock: true },
      { label: 'L', inStock: true },
    ]);
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
    this.formImageUrl.set(p.images && p.images[0]?.url ? p.images[0].url : '');
    this.formSizes.set(
      p.sizes.map((s) => ({ label: s.label, inStock: s.inStock }))
    );
    this.isModalOpen.set(true);
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

    const payload: CreateProductRequest = {
      name,
      description: this.formDescription().trim() || null,
      price: this.formPrice(),
      audience: this.formAudience(),
      categoryId: this.formCategoryId(),
      isAvailable: this.formIsAvailable(),
      isFeatured: this.formIsFeatured(),
      sizes: this.formSizes(),
    };

    const editId = this.editingProductId();
    const cat = this.categories().find((c) => c.id === payload.categoryId);
    const catName = cat?.name ?? 'General';
    const catSlug = cat?.slug ?? 'general';

    if (editId !== null) {
      // Update
      this.api.updateProduct(editId, payload).subscribe({
        next: (updated) => {
          this.products.update((list) =>
            list.map((item) => (item.id === editId ? updated : item))
          );
          this.notify('Prenda actualizada correctamente.');
        },
        error: () => {
          // Fallback actualización local
          this.products.update((list) =>
            list.map((item) =>
              item.id === editId
                ? {
                    ...item,
                    name: payload.name,
                    description: payload.description ?? null,
                    price: payload.price,
                    audience: payload.audience,
                    categoryId: payload.categoryId,
                    categoryName: catName,
                    categorySlug: catSlug,
                    isAvailable: payload.isAvailable,
                    isFeatured: payload.isFeatured,
                    sizes: payload.sizes.map((s, idx) => ({ id: idx + 1, label: s.label, inStock: s.inStock })),
                    images: this.formImageUrl()
                      ? [{ id: 1, url: this.formImageUrl(), sortOrder: 1, isPrimary: true }]
                      : item.images,
                  }
                : item
            )
          );
          this.notify('Prenda guardada localmente.');
        },
      });
    } else {
      // Create
      this.api.createProduct(payload).subscribe({
        next: (created) => {
          this.products.update((list) => [created, ...list]);
          this.notify('Prenda creada con éxito.');
        },
        error: () => {
          // Fallback creación local
          const newProduct: AdminProductDto = {
            id: Date.now(),
            name: payload.name,
            slug: payload.name.toLowerCase().replace(/\s+/g, '-'),
            description: payload.description ?? null,
            price: payload.price,
            audience: payload.audience,
            categoryId: payload.categoryId,
            categoryName: catName,
            categorySlug: catSlug,
            isAvailable: payload.isAvailable,
            isFeatured: payload.isFeatured,
            usesSizes: payload.sizes.length > 0,
            sizes: payload.sizes.map((s, idx) => ({ id: idx + 1, label: s.label, inStock: s.inStock })),
            images: [
              {
                id: 1,
                url: this.formImageUrl() || '/hero.png',
                sortOrder: 1,
                isPrimary: true,
              },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          this.products.update((list) => [newProduct, ...list]);
          this.notify('Prenda añadida localmente.');
        },
      });
    }

    this.closeModal();
  }

  toggleAvailability(p: AdminProductDto): void {
    const nextVal = !p.isAvailable;
    this.api.setProductAvailability(p.id, nextVal).subscribe({
      next: () => {
        this.products.update((list) =>
          list.map((item) => (item.id === p.id ? { ...item, isAvailable: nextVal } : item))
        );
      },
      error: () => {
        // Optimistic toggle
        this.products.update((list) =>
          list.map((item) => (item.id === p.id ? { ...item, isAvailable: nextVal } : item))
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
        this.notify('Prenda eliminada.');
      },
      error: () => {
        this.products.update((list) => list.filter((item) => item.id !== target.id));
        this.notify('Prenda eliminada.');
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
