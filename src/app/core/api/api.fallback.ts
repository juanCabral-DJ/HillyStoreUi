import {
  CategoryDto,
  FaqDto,
  PaginatedResponse,
  ProductDetailDto,
  ProductFilterParams,
  ProductListItemDto,
  StoreSettingsDto,
} from '../../shared/contracts';

/**
 * Ajustes oficiales de HillyStore (Baní, República Dominicana).
 * Conservados según requerimiento.
 */
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

export const FALLBACK_CATEGORIES: CategoryDto[] = [];

export const FALLBACK_PRODUCTS: ProductListItemDto[] = [];

export const FALLBACK_FAQS: FaqDto[] = [];

export function filterFallbackProducts(
  filters?: ProductFilterParams
): PaginatedResponse<ProductListItemDto> {
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 12;

  return {
    items: [],
    page,
    pageSize,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}

export function getFallbackProductDetail(slug: string): ProductDetailDto {
  return {
    id: 0,
    name: '',
    slug,
    description: null,
    price: 0,
    audience: 'Mujeres',
    isAvailable: false,
    isFeatured: false,
    categoryId: 0,
    categoryName: '',
    categorySlug: '',
    usesSizes: false,
    sizes: [],
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
