import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ProductDetailDto } from '../../shared/contracts';
import { SettingsService } from '../settings';

export interface PageSeoConfig {
  title: string;
  description: string;
  imageUrl?: string | null;
  canonicalPath?: string;
  type?: 'website' | 'product';
}

const SITE_NAME = 'HillyStore';
const DEFAULT_DESCRIPTION =
  'Tienda de ropa en Baní, República Dominicana. Pedidos por encargo de Shein y catálogo en stock para mujeres y hombres.';

/**
 * Configura título, descripción, etiquetas Open Graph / Twitter y canonical por página
 * durante el render del servidor (SSR) para las vistas previas en WhatsApp e Instagram.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);
  private readonly settingsService = inject(SettingsService);

  /** Configura título, meta description, etiquetas Open Graph / Twitter y canonical */
  setPageSeo(config: PageSeoConfig): void {
    const fullTitle = config.title.includes(SITE_NAME)
      ? config.title
      : `${config.title} · ${SITE_NAME}`;

    const description = config.description.trim() || DEFAULT_DESCRIPTION;
    const ogType = config.type ?? 'website';

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: description });

    // Open Graph (WhatsApp, Instagram, Facebook)
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: ogType });
    this.meta.updateTag({ property: 'og:locale', content: 'es_DO' });

    if (config.imageUrl) {
      this.meta.updateTag({ property: 'og:image', content: config.imageUrl });
      this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
      this.meta.updateTag({ name: 'twitter:image', content: config.imageUrl });
    } else {
      this.meta.removeTag("property='og:image'");
      this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
      this.meta.removeTag("name='twitter:image'");
    }

    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    if (config.canonicalPath !== undefined) {
      this.updateCanonical(config.canonicalPath);
    }
  }

  /** Atajo específico para la vista previa de una prenda en WhatsApp / Instagram */
  setProductSeo(product: ProductDetailDto): void {
    const primaryImage =
      product.images.find((img) => img.isPrimary)?.url ?? product.images[0]?.url ?? null;

    const priceFormatted = `RD$ ${product.price.toLocaleString('es-DO')}`;
    const availabilityLabel = product.isAvailable ? 'Disponible en stock' : 'Agotado';
    const sizesLabel =
      product.usesSizes && product.sizes.length > 0
        ? ` · Tallas: ${product.sizes
            .filter((s) => s.inStock)
            .map((s) => s.label)
            .join(', ')}`
        : '';

    const description =
      product.description?.trim() ||
      `${priceFormatted} · ${availabilityLabel}${sizesLabel} en ${SITE_NAME} (${this.settingsService.settings().address}).`;

    this.setPageSeo({
      title: `${product.name} (${priceFormatted})`,
      description,
      imageUrl: primaryImage,
      canonicalPath: `/catalogo/${product.slug}`,
      type: 'product',
    });
  }

  private updateCanonical(path: string): void {
    const origin = this.doc.location?.origin ?? '';
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const href = origin ? `${origin}${normalizedPath}` : normalizedPath;

    let link: HTMLLinkElement | null = this.doc.querySelector("link[rel='canonical']");
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', href);
    this.meta.updateTag({ property: 'og:url', content: href });
  }
}
