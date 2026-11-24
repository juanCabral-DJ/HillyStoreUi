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
          this.categories.set([]);
        }
        this.updateCatalogSeo();
      },
      error: () => {
        this.categories.set([]);
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
        if (res && res.items) {
          this.products.set(res.items);
          this.totalCount.set(res.totalCount);
          this.totalPages.set(res.totalPages || 1);
        } else {
          this.products.set([]);
          this.totalCount.set(0);
          this.totalPages.set(1);
        }
        this.loading.set(false);
      },
      error: () => {
        this.products.set([]);
        this.totalCount.set(0);
        this.totalPages.set(1);
        this.loading.set(false);
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
