import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Skeleton } from 'primeng/skeleton';
import { ApiClient } from '../../../../core/api';
import { SeoService } from '../../../../core/seo';
import { WhatsappService } from '../../../../core/whatsapp';
import {
  Audience,
  CategoryDto,
  ProductFilterParams,
  ProductListItemDto,
} from '../../../../shared/contracts';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Skeleton],
  templateUrl: './catalog-list.component.html',
  styleUrl: './catalog-list.component.scss',
})
export class CatalogListComponent implements OnInit {
  private readonly api = inject(ApiClient);
  private readonly whatsapp = inject(WhatsappService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly products = signal<ProductListItemDto[]>([]);
  readonly categories = signal<CategoryDto[]>([]);
  readonly loading = signal<boolean>(true);
  readonly totalCount = signal<number>(0);
  readonly totalPages = signal<number>(1);
  readonly currentPage = signal<number>(1);

  // Filtros activos
  readonly selectedAudience = signal<Audience | 'Todos'>('Todos');
  readonly selectedCategory = signal<string>('todas');
  readonly selectedSize = signal<string>('todas');
  readonly searchQuery = signal<string>('');

  readonly availableSizes: string[] = ['todas', 'XS', 'S', 'M', 'L', 'XL', '30', '32', '34'];

  ngOnInit(): void {
    this.seo.setPageSeo({
      title: 'Catálogo de Ropa en Stock en Baní · Mujeres y Hombres | HillyStore',
      description:
        'Explora las prendas en stock disponibles hoy en Baní: vestidos, camisas de lino, polos, jeans, accesorios y colonias. Pide fácil por WhatsApp.',
      canonicalPath: '/catalogo',
    });

    this.loadCategories();

    this.route.queryParamMap.subscribe((params) => {
      const publico = params.get('publico') as Audience | null;
      this.selectedAudience.set(publico === 'Mujeres' || publico === 'Hombres' ? publico : 'Todos');

      const categoria = params.get('categoria');
      this.selectedCategory.set(categoria || 'todas');

      const talla = params.get('talla');
      this.selectedSize.set(talla || 'todas');

      const buscar = params.get('buscar');
      this.searchQuery.set(buscar || '');

      const pagina = parseInt(params.get('pagina') || '1', 10);
      this.currentPage.set(isNaN(pagina) || pagina < 1 ? 1 : pagina);

      this.fetchProducts();
    });
  }

  loadCategories(): void {
    this.api.getCategories().subscribe({
      next: (cats) => {
        if (cats && cats.length > 0) {
          this.categories.set(cats.filter((c) => c.isActive));
        } else {
          this.categories.set(this.getFallbackCategories());
        }
        this.updateCatalogSeo();
      },
      error: () => {
        this.categories.set(this.getFallbackCategories());
        this.updateCatalogSeo();
      },
    });
  }

  fetchProducts(): void {
    this.loading.set(true);
    this.updateCatalogSeo();

    const filter: ProductFilterParams = {
      page: this.currentPage(),
      pageSize: 12,
      isAvailable: true,
    };

    if (this.selectedAudience() !== 'Todos') {
      filter.audience = this.selectedAudience() as Audience;
    }
    if (this.selectedCategory() !== 'todas') {
      filter.category = this.selectedCategory();
    }
    if (this.selectedSize() !== 'todas') {
      filter.size = this.selectedSize();
    }
    if (this.searchQuery().trim()) {
      filter.search = this.searchQuery().trim();
    }

    this.api.getProducts(filter).subscribe({
      next: (res) => {
        if (res && res.items && res.items.length > 0) {
          this.products.set(res.items);
          this.totalCount.set(res.totalCount);
          this.totalPages.set(res.totalPages);
          this.loading.set(false);
        } else {
          this.applyLocalFallbackFilter();
        }
      },
      error: () => {
        this.applyLocalFallbackFilter();
      },
    });
  }

  setAudience(audience: Audience | 'Todos'): void {
    this.updateQueryParams({
      publico: audience === 'Todos' ? null : audience,
      pagina: null,
    });
  }

  setCategory(slug: string): void {
    this.updateQueryParams({
      categoria: slug === 'todas' ? null : slug,
      pagina: null,
    });
  }

  setSize(size: string): void {
    this.updateQueryParams({
      talla: size === 'todas' ? null : size,
      pagina: null,
    });
  }

  onSearchSubmit(): void {
    this.updateQueryParams({
      buscar: this.searchQuery().trim() || null,
      pagina: null,
    });
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.updateQueryParams({ buscar: null, pagina: null });
  }

  clearAllFilters(): void {
    this.searchQuery.set('');
    this.router.navigate(['/catalogo']);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.updateQueryParams({ pagina: page === 1 ? null : page });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onOrderWhatsApp(product: ProductListItemDto, event: Event): void {
    event.stopPropagation();
    this.whatsapp.openStockOrder({
      productName: product.name,
      productSlug: product.slug,
      price: product.price,
      selectedSize: product.availableSizes?.[0],
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = '/hero.png';
  }

  private updateQueryParams(params: Record<string, any>): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }

  private applyLocalFallbackFilter(): void {
    let list = this.getFallbackCatalog();

    // Filtro por público (Mujeres / Hombres)
    if (this.selectedAudience() !== 'Todos') {
      list = list.filter((p) => p.audience === this.selectedAudience());
    }

    // Filtro por categoría
    if (this.selectedCategory() !== 'todas') {
      list = list.filter((p) => p.categorySlug === this.selectedCategory());
    }

    // Filtro por talla
    if (this.selectedSize() !== 'todas') {
      list = list.filter((p) => p.availableSizes.includes(this.selectedSize()));
    }

    // Filtro por texto de búsqueda
    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      );
    }

    this.totalCount.set(list.length);
    const pageSize = 12;
    this.totalPages.set(Math.max(1, Math.ceil(list.length / pageSize)));

    const start = (this.currentPage() - 1) * pageSize;
    this.products.set(list.slice(start, start + pageSize));
    this.loading.set(false);
  }

  private getFallbackCategories(): CategoryDto[] {
    return [
      { id: 1, name: 'Vestidos', slug: 'vestidos', usesSizes: true, sortOrder: 1, isActive: true },
      { id: 2, name: 'Camisas', slug: 'camisas', usesSizes: true, sortOrder: 2, isActive: true },
      { id: 3, name: 'Tops & Blusas', slug: 'tops-blusas', usesSizes: true, sortOrder: 3, isActive: true },
      { id: 4, name: 'Pantalones & Jeans', slug: 'pantalones', usesSizes: true, sortOrder: 4, isActive: true },
      { id: 5, name: 'Polos & T-Shirts', slug: 'polos-t-shirts', usesSizes: true, sortOrder: 5, isActive: true },
      { id: 6, name: 'Conjuntos & Blazers', slug: 'conjuntos-blazers', usesSizes: true, sortOrder: 6, isActive: true },
      { id: 7, name: 'Shorts & Bermudas', slug: 'shorts-bermudas', usesSizes: true, sortOrder: 7, isActive: true },
      { id: 8, name: 'Accesorios', slug: 'accesorios', usesSizes: false, sortOrder: 8, isActive: true },
      { id: 9, name: 'Colonias & Splashes', slug: 'colonias', usesSizes: false, sortOrder: 9, isActive: true },
    ];
  }

  private getFallbackCatalog(): ProductListItemDto[] {
    return [
      {
        id: 1,
        name: 'Vestido Corto Satinado Drapeado',
        slug: 'vestido-corto-satinado-drapeado',
        price: 1450,
        audience: 'Mujeres',
        isAvailable: true,
        isFeatured: true,
        categoryId: 1,
        categoryName: 'Vestidos',
        categorySlug: 'vestidos',
        usesSizes: true,
        primaryImageUrl:
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=700&q=80',
        availableSizes: ['XS', 'S', 'M'],
      },
      {
        id: 2,
        name: 'Camisa Lino Regular Fit Manga Larga',
        slug: 'camisa-lino-regular-fit',
        price: 1650,
        audience: 'Hombres',
        isAvailable: true,
        isFeatured: true,
        categoryId: 2,
        categoryName: 'Camisas',
        categorySlug: 'camisas',
        usesSizes: true,
        primaryImageUrl:
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=80',
        availableSizes: ['M', 'L', 'XL'],
      },
      {
        id: 3,
        name: 'Top Halter Acanalado Fiesta',
        slug: 'top-halter-acanalado-fiesta',
        price: 850,
        audience: 'Mujeres',
        isAvailable: true,
        isFeatured: true,
        categoryId: 3,
        categoryName: 'Tops & Blusas',
        categorySlug: 'tops-blusas',
        usesSizes: true,
        primaryImageUrl:
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=80',
        availableSizes: ['S', 'M'],
      },
      {
        id: 4,
        name: 'Jean Wide Leg Tiro Alto Vintage',
        slug: 'jean-wide-leg-tiro-alto',
        price: 1850,
        audience: 'Mujeres',
        isAvailable: true,
        isFeatured: true,
        categoryId: 4,
        categoryName: 'Pantalones & Jeans',
        categorySlug: 'pantalones',
        usesSizes: true,
        primaryImageUrl:
          'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80',
        availableSizes: ['S', 'M', 'L'],
      },
      {
        id: 5,
        name: 'Polo Piqué Cuello Contraste',
        slug: 'polo-pique-cuello-contraste',
        price: 1250,
        audience: 'Hombres',
        isAvailable: true,
        isFeatured: true,
        categoryId: 5,
        categoryName: 'Polos & T-Shirts',
        categorySlug: 'polos-t-shirts',
        usesSizes: true,
        primaryImageUrl:
          'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=700&q=80',
        availableSizes: ['S', 'M', 'L', 'XL'],
      },
      {
        id: 6,
        name: 'Blazer Entallado Lino Crudo',
        slug: 'blazer-entallado-lino-crudo',
        price: 2350,
        audience: 'Mujeres',
        isAvailable: true,
        isFeatured: true,
        categoryId: 6,
        categoryName: 'Conjuntos & Blazers',
        categorySlug: 'conjuntos-blazers',
        usesSizes: true,
        primaryImageUrl:
          'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=700&q=80',
        availableSizes: ['S', 'M'],
      },
      {
        id: 7,
        name: 'Bermuda Chino Algodón Elástico',
        slug: 'bermuda-chino-algodon-elastico',
        price: 1350,
        audience: 'Hombres',
        isAvailable: true,
        isFeatured: true,
        categoryId: 7,
        categoryName: 'Shorts & Bermudas',
        categorySlug: 'shorts-bermudas',
        usesSizes: true,
        primaryImageUrl:
          'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=700&q=80',
        availableSizes: ['30', '32', '34'],
      },
      {
        id: 8,
        name: 'Conjunto Crop Top y Falda Plisada',
        slug: 'conjunto-crop-top-y-falda-plisada',
        price: 2100,
        audience: 'Mujeres',
        isAvailable: true,
        isFeatured: true,
        categoryId: 6,
        categoryName: 'Conjuntos & Blazers',
        categorySlug: 'conjuntos-blazers',
        usesSizes: true,
        primaryImageUrl:
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80',
        availableSizes: ['XS', 'S', 'M'],
      },
      {
        id: 9,
        name: 'Cartera Bandolera Estructurada',
        slug: 'cartera-bandolera-estructurada',
        price: 1600,
        audience: 'Mujeres',
        isAvailable: true,
        isFeatured: false,
        categoryId: 8,
        categoryName: 'Accesorios',
        categorySlug: 'accesorios',
        usesSizes: false,
        primaryImageUrl:
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=80',
        availableSizes: [],
      },
      {
        id: 10,
        name: 'Colonia Body Mist Floral Fresh',
        slug: 'colonia-body-mist-floral-fresh',
        price: 750,
        audience: 'Mujeres',
        isAvailable: true,
        isFeatured: false,
        categoryId: 9,
        categoryName: 'Colonias & Splashes',
        categorySlug: 'colonias',
        usesSizes: false,
        primaryImageUrl:
          'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=700&q=80',
        availableSizes: [],
      },
      {
        id: 11,
        name: 'Camisa Guayabera Lino Manga Corta',
        slug: 'camisa-guayabera-lino-manga-corta',
        price: 1800,
        audience: 'Hombres',
        isAvailable: true,
        isFeatured: false,
        categoryId: 2,
        categoryName: 'Camisas',
        categorySlug: 'camisas',
        usesSizes: true,
        primaryImageUrl:
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80',
        availableSizes: ['M', 'L', 'XL'],
      },
      {
        id: 12,
        name: 'Vestido Midi Floral Bohemio',
        slug: 'vestido-midi-floral-bohemio',
        price: 1750,
        audience: 'Mujeres',
        isAvailable: true,
        isFeatured: false,
        categoryId: 1,
        categoryName: 'Vestidos',
        categorySlug: 'vestidos',
        usesSizes: true,
        primaryImageUrl:
          'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=700&q=80',
        availableSizes: ['S', 'M', 'L'],
      },
    ];
  }

  private updateCatalogSeo(): void {
    const catSlug = this.selectedCategory();
    const aud = this.selectedAudience();
    const cat = this.categories().find((c) => c.slug === catSlug);

    let title = 'Catálogo de Ropa en Stock en Baní';
    if (cat && aud !== 'Todos') {
      title = `${cat.name} para ${aud} en Stock en Baní | HillyStore`;
    } else if (cat) {
      title = `${cat.name} en Stock en Baní | HillyStore`;
    } else if (aud !== 'Todos') {
      title = `Ropa para ${aud} en Stock en Baní | HillyStore`;
    } else {
      title = 'Catálogo de Ropa en Stock en Baní · Mujeres y Hombres | HillyStore';
    }

    const desc = cat
      ? `Explora ${cat.name.toLowerCase()} en stock disponibles hoy mismo en Baní, Peravia. Entrega inmediata y pedidos fáciles por WhatsApp con HillyStore.`
      : 'Explora las prendas en stock disponibles hoy en Baní: vestidos, camisas de lino, polos, jeans, accesorios y colonias. Pide fácil por WhatsApp.';

    this.seo.setPageSeo({
      title,
      description: desc,
      canonicalPath: '/catalogo',
    });
  }
}
