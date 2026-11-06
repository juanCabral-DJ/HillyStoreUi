/**
 * Contratos de datos de la API de HillyStore.
 * Convenciones:
 * - JSON en camelCase
 * - Enums como texto ('Mujeres' | 'Hombres' | 'Ninos')
 * - Fechas ISO 8601 en UTC (string)
 * - Horas en formato HH:mm (string)
 * - Precios en RD$ (number)
 */

// ==========================================================
// ENUMS Y TIPOS BASE
// ==========================================================

/** Público objetivo */
export type Audience = 'Mujeres' | 'Hombres';

export const AUDIENCE_LABELS: Record<Audience, string> = {
  Mujeres: 'Mujeres',
  Hombres: 'Hombres',
};

/** Estructura estándar de error devuelta por el backend y normalizada por el interceptor */
export interface ApiError {
  status: number;
  code: string;
  message: string;
  errors?: Record<string, string[]>;
}

/** Respuesta paginada estándar */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ==========================================================
// CATEGORÍAS
// ==========================================================

export interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  usesSizes: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface UpsertCategoryRequest {
  name: string;
  slug?: string;
  usesSizes: boolean;
  sortOrder: number;
  isActive: boolean;
}

/** Tarjeta visual de categoría para la portada o navegadores de colección */
export interface HomeCategoryCard {
  id: string | number;
  title: string;
  subtitle: string;
  slug: string;
  routeQuery: Record<string, string>;
  imageUrl: string;
  badge?: string;
}

/** Ítem informativo de entregas, pagos y garantías */
export interface DeliveryPaymentFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
  badge?: string;
  highlight?: string;
}

// ==========================================================
// PRENDAS / PRODUCTOS
// ==========================================================

export interface ProductSizeDto {
  id: number;
  label: string;
  inStock: boolean;
}

export interface ProductImageDto {
  id: number;
  url: string;
  sortOrder: number;
  isPrimary: boolean;
}

/** Ítem resumido para el listado del catálogo y el carrusel de destacadas */
export interface ProductListItemDto {
  id: number;
  name: string;
  slug: string;
  price: number;
  audience: Audience;
  isAvailable: boolean;
  isFeatured: boolean;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  usesSizes: boolean;
  primaryImageUrl: string | null;
  availableSizes: string[];
}

/** Detalle completo de una prenda (público) */
export interface ProductDetailDto {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  audience: Audience;
  isAvailable: boolean;
  isFeatured: boolean;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  usesSizes: boolean;
  sizes: ProductSizeDto[];
  images: ProductImageDto[];
  createdAt: string;
  updatedAt: string;
}

/** Detalle completo de una prenda para el panel de administración */
export interface AdminProductDto extends ProductDetailDto {}

/** Parámetros de filtrado y paginación para GET /api/products y GET /api/admin/products */
export interface ProductFilterParams {
  audience?: Audience;
  category?: string;
  categoryId?: number;
  size?: string;
  search?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  page?: number;
  pageSize?: number;
}

/** Estado de filtros en la vista de catálogo público */
export interface CatalogFilterState {
  audience?: Audience | 'Todos';
  categorySlug?: string;
  size?: string;
  search?: string;
  page: number;
}

export interface UpsertProductSizeInput {
  label: string;
  inStock: boolean;
}

export interface CreateProductRequest {
  name: string;
  slug?: string;
  description?: string | null;
  price: number;
  audience: Audience;
  categoryId: number;
  isAvailable: boolean;
  isFeatured: boolean;
  sizes: UpsertProductSizeInput[];
}

export interface UpdateProductRequest extends CreateProductRequest {}

export interface UpdateProductAvailabilityRequest {
  isAvailable: boolean;
}

export interface ReorderProductImagesRequest {
  imageIds: number[];
}

// ==========================================================
// AJUSTES DE LA TIENDA (StoreSettings)
// ==========================================================

export interface StoreSettingsDto {
  whatsAppNumber: string;
  address: string; 
  opensAt: string; // HH:mm
  closesAt: string; // HH:mm
  instagramUrl: string;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  depositPercentage: number;
  sheinMinDays: number;
  sheinMaxDays: number;
}

export interface UpdateStoreSettingsRequest extends StoreSettingsDto {}

// ==========================================================
// PREGUNTAS FRECUENTES (FAQ)
// ==========================================================

export interface FaqDto {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

export interface UpsertFaqRequest {
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

// ==========================================================
// FORMULARIO PEDIDOS SHEIN
// ==========================================================

export interface SheinFormItem {
  id: string;
  link: string;
  size: string;
  notes?: string;
}

// ==========================================================
// AUTENTICACIÓN Y ADMIN
// ==========================================================

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AdminUserDto {
  id: number;
  email: string;
  displayName: string;
}

export interface AuthLoginResponse {
  token: string;
  expiresAt: string; // ISO UTC
  user: AdminUserDto;
}
