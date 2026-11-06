import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnimateOnScroll } from 'primeng/animateonscroll';
import { Carousel, CarouselResponsiveOptions } from 'primeng/carousel';
import { Skeleton } from 'primeng/skeleton';
import { ApiClient } from '../../../../core/api';
import { WhatsappService } from '../../../../core/whatsapp';
import { ProductListItemDto } from '../../../../shared/contracts';

@Component({
  selector: 'app-stock-carousel',
  standalone: true,
  imports: [CommonModule, RouterLink, Carousel, Skeleton, AnimateOnScroll],
  templateUrl: './stock-carousel.component.html',
  styleUrl: './stock-carousel.component.scss',
})
export class StockCarouselComponent implements OnInit {
  private readonly api = inject(ApiClient);
  private readonly whatsappService = inject(WhatsappService);

  readonly products = signal<ProductListItemDto[]>([]);
  readonly loading = signal<boolean>(true);

  readonly responsiveOptions: CarouselResponsiveOptions[] = [
    {
      breakpoint: '1360px',
      numVisible: 4,
      numScroll: 1,
    },
    {
      breakpoint: '1080px',
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1,
    },
  ];

  ngOnInit(): void {
    this.fetchFeaturedProducts();
  }

  fetchFeaturedProducts(): void {
    this.loading.set(true);
    this.api.getFeaturedProducts().subscribe({
      next: (items) => {
        if (items && items.length > 0) {
          this.products.set(items.slice(0, 8));
        } else {
          this.products.set(this.getFallbackProducts());
        }
        this.loading.set(false);
      },
      error: () => {
        // Fallback elegante para renderizado SSR o desarrollo local sin backend encendido
        this.products.set(this.getFallbackProducts());
        this.loading.set(false);
      },
    });
  }

  onOrderWhatsApp(product: ProductListItemDto, event?: Event): void {
    event?.stopPropagation();
    this.whatsappService.openStockOrder({
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

  private getFallbackProducts(): ProductListItemDto[] {
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
    ];
  }
}
