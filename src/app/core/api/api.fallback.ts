import {
  CategoryDto,
  FaqDto,
  PaginatedResponse,
  ProductDetailDto,
  ProductFilterParams,
  ProductListItemDto,
  StoreSettingsDto,
} from '../../shared/contracts';

export const FALLBACK_SETTINGS: StoreSettingsDto = {
  whatsAppNumber: '8295551234',
  address: 'Calle 0001, El Llano, Baní, República Dominicana',
  opensAt: '09:00',
  closesAt: '17:00',
  instagramUrl: 'https://instagram.com/hillystore',
  facebookUrl: null,
  tiktokUrl: null,
  depositPercentage: 50,
  sheinMinDays: 15,
  sheinMaxDays: 20,
};

export const FALLBACK_CATEGORIES: CategoryDto[] = [
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

export const FALLBACK_PRODUCTS: ProductListItemDto[] = [
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
    primaryImageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=700&q=80',
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
    primaryImageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=80',
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
    primaryImageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=80',
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
    primaryImageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80',
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
    primaryImageUrl: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=700&q=80',
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
    primaryImageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=700&q=80',
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
    primaryImageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=700&q=80',
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
    primaryImageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80',
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
    primaryImageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=80',
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
    primaryImageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=700&q=80',
    availableSizes: [],
  },
];

export const FALLBACK_FAQS: FaqDto[] = [
  {
    id: 1,
    question: '¿Cómo realizo un pedido de Shein si no tengo tarjeta internacional ni casillero?',
    answer:
      'Es muy fácil: buscas las prendas que te gusten en Shein y nos envías los enlaces o capturas por WhatsApp indicando tu talla. Te cotizamos el total en pesos dominicanos (RD$) y abonas el 50% de anticipo por transferencia bancaria (Banreservas, Popular, BHD) o en efectivo en nuestra tienda. El restante 50% lo completas cuando tu paquete llegue a Baní.',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 2,
    question: '¿Cuánto tiempo tarda en llegar mi pedido de Shein a Baní?',
    answer:
      'El tiempo estimado de entrega es de 15 a 20 días a partir de la confirmación de tu anticipo. Te mantenemos al tanto del estado del paquete y te avisamos tan pronto esté listo para que pases a retirarlo o coordinar tu envío local.',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 3,
    question: '¿Puedo medirme la ropa en stock antes de comprar?',
    answer:
      '¡Claro que sí! Todas las prendas marcadas como "En Stock" están físicamente en nuestra tienda en Baní (Calle 0001, El Llano). Puedes visitarnos de lunes a sábado de 9:00 a.m. a 5:00 p.m. para probártelas, comprobar la calidad y llevarte tu prenda al instante.',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 4,
    question: '¿Cuáles son los métodos de pago aceptados?',
    answer:
      'Aceptamos transferencias bancarias en moneda nacional (RD$) a través de Banco Popular Dominicano, Banreservas y Banco BHD. Si retiras en tienda o solicitas envío local contra entrega, también puedes pagar en efectivo.',
    sortOrder: 4,
    isActive: true,
  },
];

export function filterFallbackProducts(
  filters?: ProductFilterParams
): PaginatedResponse<ProductListItemDto> {
  let list = [...FALLBACK_PRODUCTS];

  if (filters?.audience) {
    list = list.filter((p) => p.audience === filters.audience);
  }
  if (filters?.category) {
    list = list.filter((p) => p.categorySlug === filters.category);
  }
  if (filters?.size) {
    list = list.filter((p) => p.availableSizes.includes(filters.size!));
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q));
  }
  if (filters?.isAvailable !== undefined) {
    list = list.filter((p) => p.isAvailable === filters.isAvailable);
  }
  if (filters?.isFeatured !== undefined) {
    list = list.filter((p) => p.isFeatured === filters.isFeatured);
  }

  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 12;
  const start = (page - 1) * pageSize;
  const items = list.slice(start, start + pageSize);
  const totalCount = list.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    items,
    page,
    pageSize,
    totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function getFallbackProductDetail(slug: string): ProductDetailDto {
  const item = FALLBACK_PRODUCTS.find((p) => p.slug === slug) || FALLBACK_PRODUCTS[0];
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: `Prenda original importada con acabados de primera calidad. Disponible para probarse y retirar inmediatamente en nuestra tienda física de El Llano, Baní.`,
    price: item.price,
    audience: item.audience,
    isAvailable: item.isAvailable,
    isFeatured: item.isFeatured,
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    categorySlug: item.categorySlug,
    usesSizes: item.usesSizes,
    sizes: item.availableSizes.map((s, idx) => ({ id: idx + 1, label: s, inStock: true })),
    images: item.primaryImageUrl
      ? [{ id: 1, url: item.primaryImageUrl, sortOrder: 1, isPrimary: true }]
      : [{ id: 1, url: '/hero.png', sortOrder: 1, isPrimary: true }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
