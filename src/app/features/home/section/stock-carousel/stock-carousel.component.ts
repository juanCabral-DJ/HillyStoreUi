import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Carousel, CarouselResponsiveOptions } from 'primeng/carousel';
import { Skeleton } from 'primeng/skeleton';
import { ApiClient } from '../../../../core/api';
import { WhatsappService } from '../../../../core/whatsapp';
import { ProductListItemDto } from '../../../../shared/contracts';

@Component({
  selector: 'app-stock-carousel',
  standalone: true,
  imports: [CommonModule, RouterLink, Carousel, Skeleton],
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
        this.products.set(items || []);
        this.loading.set(false);
      },
      error: () => {
        this.products.set([]);
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
}

