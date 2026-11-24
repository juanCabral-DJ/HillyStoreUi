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
          this.product.set(null);
          this.loading.set(false);
        }
      },
      error: () => {
        this.product.set(null);
        this.loading.set(false);
      },
    });

    this.loadRelatedProducts(slug);
  }

  private setProductData(item: ProductDetailDto): void {
    this.product.set(item);
    this.selectedImageIndex.set(0);

    // Selecciona por defecto la primera talla disponible en stock
    const firstAvailable = (item.sizes || []).find((s) => s.inStock)?.label || null;
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
          this.relatedProducts.set([]);
        }
      },
      error: () => {
        this.relatedProducts.set([]);
      },
    });
  }
}

