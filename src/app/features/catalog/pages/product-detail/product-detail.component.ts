import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Skeleton } from 'primeng/skeleton';
import { ApiClient } from '../../../../core/api';
import { SeoService } from '../../../../core/seo';
import { SettingsService } from '../../../../core/settings';
import { WhatsappService } from '../../../../core/whatsapp';
import {
  ProductDetailDto,
  ProductListItemDto,
} from '../../../../shared/contracts';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, Skeleton],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  private readonly api = inject(ApiClient);
  private readonly whatsapp = inject(WhatsappService);
  private readonly seo = inject(SeoService);
  protected readonly settingsService = inject(SettingsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly product = signal<ProductDetailDto | null>(null);
  readonly selectedImageIndex = signal<number>(0);
  readonly selectedSize = signal<string | null>(null);
  readonly loading = signal<boolean>(true);
  readonly relatedProducts = signal<ProductListItemDto[]>([]);

  readonly currentImage = computed(() => {
    const prod = this.product();
    if (!prod || !prod.images || prod.images.length === 0) {
      return '/hero.png';
    }
    const idx = this.selectedImageIndex();
    return prod.images[idx]?.url || prod.images[0]?.url || '/hero.png';
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.loadProduct(slug);
      } else {
        this.router.navigate(['/catalogo']);
      }
    });
  }

  loadProduct(slug: string): void {
    this.loading.set(true);
    this.api.getProductBySlug(slug).subscribe({
      next: (item) => {
        if (item) {
          this.setProductData(item);
        } else {
          this.setProductData(this.getFallbackProduct(slug));
        }
      },
      error: () => {
        this.setProductData(this.getFallbackProduct(slug));
      },
    });

    this.loadRelatedProducts(slug);
  }

  private setProductData(item: ProductDetailDto): void {
    this.product.set(item);
    this.selectedImageIndex.set(0);

    // Selecciona por defecto la primera talla disponible en stock
    const firstAvailable = item.sizes.find((s) => s.inStock)?.label || null;
    this.selectedSize.set(firstAvailable);

    this.seo.setProductSeo(item);

    this.loading.set(false);
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  selectSize(sizeLabel: string, inStock: boolean): void {
    if (!inStock) return;
    this.selectedSize.set(sizeLabel);
  }

  onOrderWhatsApp(): void {
    const prod = this.product();
    if (!prod) return;

    this.whatsapp.openStockOrder({
      productName: prod.name,
      productSlug: prod.slug,
      price: prod.price,
      selectedSize: this.selectedSize() || undefined,
    });
  }

  onAskFittingInStore(): void {
    const prod = this.product();
    if (!prod) return;

    const sizeText = this.selectedSize() ? ` en talla ${this.selectedSize()}` : '';
    const message = `¡Hola HillyStore! Me interesa pasar por la tienda en El Llano, Baní, para probarme esta prenda:${sizeText}\n• *${prod.name}* (RD$ ${prod.price.toLocaleString('es-DO')})\n¿Tienen disponible para probador hoy?`;
    this.whatsapp.openGeneralInquiry(message);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = '/hero.png';
  }

  private loadRelatedProducts(currentSlug: string): void {
    this.api.getFeaturedProducts().subscribe({
      next: (items) => {
        if (items && items.length > 0) {
          this.relatedProducts.set(items.filter((p) => p.slug !== currentSlug).slice(0, 4));
        } else {
          this.relatedProducts.set(this.getFallbackRelated(currentSlug));
        }
      },
      error: () => {
        this.relatedProducts.set(this.getFallbackRelated(currentSlug));
      },
    });
  }

  private getFallbackProduct(slug: string): ProductDetailDto {
    return {
      id: 1,
      name: 'Vestido Corto Satinado Drapeado',
      slug: slug || 'vestido-corto-satinado-drapeado',
      description:
        'Elegante vestido corto confeccionado en satén brillante de alta calidad con detalle drapeado lateral. Ideal para ocasiones especiales, cócteles o salidas nocturnas en Baní. Tejido suave al tacto con caída impecable.',
      price: 1450,
      audience: 'Mujeres',
      isAvailable: true,
      isFeatured: true,
      categoryId: 1,
      categoryName: 'Vestidos',
      categorySlug: 'vestidos',
      usesSizes: true,
      sizes: [
        { id: 1, label: 'XS', inStock: true },
        { id: 2, label: 'S', inStock: true },
        { id: 3, label: 'M', inStock: true },
        { id: 4, label: 'L', inStock: false },
      ],
      images: [
        {
          id: 1,
          url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80',
          sortOrder: 1,
          isPrimary: true,
        },
        {
          id: 2,
          url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
          sortOrder: 2,
          isPrimary: false,
        },
        {
          id: 3,
          url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=80',
          sortOrder: 3,
          isPrimary: false,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private getFallbackRelated(currentSlug: string): ProductListItemDto[] {
    const list: ProductListItemDto[] = [
      {
        id: 2,
        name: 'Camisa Lino Regular Fit',
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
        name: 'Jean Wide Leg Tiro Alto',
        slug: 'jean-wide-leg-tiro-alto',
        price: 1850,
        audience: 'Mujeres',
        isAvailable: true,
        isFeatured: true,
        categoryId: 4,
        categoryName: 'Pantalones',
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
    ];

    return list.filter((p) => p.slug !== currentSlug).slice(0, 4);
  }
}
