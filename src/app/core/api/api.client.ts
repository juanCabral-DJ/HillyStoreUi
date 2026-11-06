import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  AdminProductDto,
  AuthLoginRequest,
  AuthLoginResponse,
  CategoryDto,
  CreateProductRequest,
  FaqDto,
  PaginatedResponse,
  ProductDetailDto,
  ProductFilterParams,
  ProductImageDto,
  ProductListItemDto,
  ReorderProductImagesRequest,
  StoreSettingsDto,
  UpdateProductAvailabilityRequest,
  UpdateProductRequest,
  UpdateStoreSettingsRequest,
  UpsertCategoryRequest,
  UpsertFaqRequest,
} from '../../shared/contracts';
import {
  FALLBACK_CATEGORIES,
  FALLBACK_FAQS,
  FALLBACK_PRODUCTS,
  FALLBACK_SETTINGS,
  filterFallbackProducts,
  getFallbackProductDetail,
} from './api.fallback';
import { API_BASE_URL } from './api.tokens';

/**
 * Cliente HTTP centralizado de HillyStore.
 * Un método por endpoint según los contratos de la sección 6 del plan.
 * Cuenta con resiliencia en SSR para evitar bucles recursivos cuando la API no esté en línea.
 */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly baseUrl = inject(API_BASE_URL).replace(/\/+$/, '');
  private readonly isAbsoluteApiUrl =
    this.baseUrl.startsWith('http://') || this.baseUrl.startsWith('https://');

  private get shouldUseFallbackOnSsr(): boolean {
    return !this.isBrowser && !this.isAbsoluteApiUrl;
  }

  // ==========================================================
  // ENDPOINTS PÚBLICOS
  // ==========================================================

  /** GET /api/products — Catálogo con filtros y paginación (12 por página, máx. 48) */
  getProducts(filters?: ProductFilterParams): Observable<PaginatedResponse<ProductListItemDto>> {
    if (this.shouldUseFallbackOnSsr) {
      return of(filterFallbackProducts(filters));
    }
    return this.http.get<PaginatedResponse<ProductListItemDto>>(`${this.baseUrl}/products`, {
      params: this.toHttpParams(filters),
    });
  }

  /** GET /api/products/featured — Destacadas del inicio (máx. 8) */
  getFeaturedProducts(): Observable<ProductListItemDto[]> {
    if (this.shouldUseFallbackOnSsr) {
      return of(FALLBACK_PRODUCTS.filter((p) => p.isFeatured).slice(0, 8));
    }
    return this.http.get<ProductListItemDto[]>(`${this.baseUrl}/products/featured`);
  }

  /** GET /api/products/{slug} — Detalle de prenda por slug */
  getProductBySlug(slug: string): Observable<ProductDetailDto> {
    if (this.shouldUseFallbackOnSsr) {
      return of(getFallbackProductDetail(slug));
    }
    return this.http.get<ProductDetailDto>(
      `${this.baseUrl}/products/${encodeURIComponent(slug)}`
    );
  }

  /** GET /api/categories — Categorías activas */
  getCategories(): Observable<CategoryDto[]> {
    if (this.shouldUseFallbackOnSsr) {
      return of(FALLBACK_CATEGORIES);
    }
    return this.http.get<CategoryDto[]>(`${this.baseUrl}/categories`);
  }

  /** GET /api/settings — Ajustes de la tienda */
  getSettings(): Observable<StoreSettingsDto> {
    if (this.shouldUseFallbackOnSsr) {
      return of(FALLBACK_SETTINGS);
    }
    return this.http.get<StoreSettingsDto>(`${this.baseUrl}/settings`);
  }

  /** GET /api/faqs — Preguntas frecuentes activas */
  getFaqs(): Observable<FaqDto[]> {
    if (this.shouldUseFallbackOnSsr) {
      return of(FALLBACK_FAQS);
    }
    return this.http.get<FaqDto[]>(`${this.baseUrl}/faqs`);
  }

  /** POST /api/auth/login — Devuelve el token JWT */
  login(credentials: AuthLoginRequest): Observable<AuthLoginResponse> {
    return this.http.post<AuthLoginResponse>(`${this.baseUrl}/auth/login`, credentials);
  }

  // ==========================================================
  // ENDPOINTS DE ADMINISTRACIÓN (/api/admin/**)
  // ==========================================================

  /** GET /api/admin/products — Lista de prendas en el panel admin */
  getAdminProducts(filters?: ProductFilterParams): Observable<PaginatedResponse<AdminProductDto>> {
    if (this.shouldUseFallbackOnSsr) {
      const paginated = filterFallbackProducts(filters);
      return of({
        ...paginated,
        items: paginated.items.map((i) => getFallbackProductDetail(i.slug)),
      });
    }
    return this.http.get<PaginatedResponse<AdminProductDto>>(`${this.baseUrl}/admin/products`, {
      params: this.toHttpParams(filters),
    });
  }

  /** GET /api/admin/products/{id} — Detalle de prenda para edición */
  getAdminProductById(id: number): Observable<AdminProductDto> {
    return this.http.get<AdminProductDto>(`${this.baseUrl}/admin/products/${id}`);
  }

  /** POST /api/admin/products — Crear nueva prenda */
  createProduct(payload: CreateProductRequest): Observable<AdminProductDto> {
    return this.http.post<AdminProductDto>(`${this.baseUrl}/admin/products`, payload);
  }

  /** PUT /api/admin/products/{id} — Actualizar prenda existente */
  updateProduct(id: number, payload: UpdateProductRequest): Observable<AdminProductDto> {
    return this.http.put<AdminProductDto>(`${this.baseUrl}/admin/products/${id}`, payload);
  }

  /** DELETE /api/admin/products/{id} — Eliminar prenda */
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/products/${id}`);
  }

  /** PATCH /api/admin/products/{id}/availability — Marcar agotada o disponible */
  setProductAvailability(id: number, isAvailable: boolean): Observable<void> {
    const body: UpdateProductAvailabilityRequest = { isAvailable };
    return this.http.patch<void>(`${this.baseUrl}/admin/products/${id}/availability`, body);
  }

  /** POST /api/admin/products/{id}/images — Subir foto (jpg, png o webp, máx. 5 MB) */
  uploadProductImage(
    productId: number,
    file: File,
    options?: { isPrimary?: boolean; sortOrder?: number }
  ): Observable<ProductImageDto> {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.isPrimary !== undefined) {
      formData.append('isPrimary', String(options.isPrimary));
    }
    if (options?.sortOrder !== undefined) {
      formData.append('sortOrder', String(options.sortOrder));
    }

    return this.http.post<ProductImageDto>(
      `${this.baseUrl}/admin/products/${productId}/images`,
      formData
    );
  }

  /** PUT /api/admin/products/{id}/images/order — Ordenar fotos de una prenda */
  reorderProductImages(productId: number, imageIds: number[]): Observable<void> {
    const body: ReorderProductImagesRequest = { imageIds };
    return this.http.put<void>(`${this.baseUrl}/admin/products/${productId}/images/order`, body);
  }

  /** PATCH /api/admin/products/{id}/images/{imageId}/primary — Elegir foto principal */
  setPrimaryProductImage(productId: number, imageId: number): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/admin/products/${productId}/images/${imageId}/primary`,
      {}
    );
  }

  /** DELETE /api/admin/products/{id}/images/{imageId} — Borrar foto */
  deleteProductImage(productId: number, imageId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/admin/products/${productId}/images/${imageId}`
    );
  }

  /** GET /api/admin/categories — Todas las categorías (activas e inactivas) */
  getAdminCategories(): Observable<CategoryDto[]> {
    if (this.shouldUseFallbackOnSsr) {
      return of(FALLBACK_CATEGORIES);
    }
    return this.http.get<CategoryDto[]>(`${this.baseUrl}/admin/categories`);
  }

  /** POST /api/admin/categories — Crear categoría */
  createCategory(payload: UpsertCategoryRequest): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(`${this.baseUrl}/admin/categories`, payload);
  }

  /** PUT /api/admin/categories/{id} — Editar categoría */
  updateCategory(id: number, payload: UpsertCategoryRequest): Observable<CategoryDto> {
    return this.http.put<CategoryDto>(`${this.baseUrl}/admin/categories/${id}`, payload);
  }

  /** DELETE /api/admin/categories/{id} — Borrar categoría (no se borra si tiene prendas) */
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/categories/${id}`);
  }

  /** GET /api/admin/faqs — Todas las preguntas frecuentes */
  getAdminFaqs(): Observable<FaqDto[]> {
    if (this.shouldUseFallbackOnSsr) {
      return of(FALLBACK_FAQS);
    }
    return this.http.get<FaqDto[]>(`${this.baseUrl}/admin/faqs`);
  }

  /** POST /api/admin/faqs — Crear pregunta frecuente */
  createFaq(payload: UpsertFaqRequest): Observable<FaqDto> {
    return this.http.post<FaqDto>(`${this.baseUrl}/admin/faqs`, payload);
  }

  /** PUT /api/admin/faqs/{id} — Editar pregunta frecuente */
  updateFaq(id: number, payload: UpsertFaqRequest): Observable<FaqDto> {
    return this.http.put<FaqDto>(`${this.baseUrl}/admin/faqs/${id}`, payload);
  }

  /** DELETE /api/admin/faqs/{id} — Borrar pregunta frecuente */
  deleteFaq(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/faqs/${id}`);
  }

  /** PUT /api/admin/settings — Editar ajustes de la tienda */
  updateSettings(payload: UpdateStoreSettingsRequest): Observable<StoreSettingsDto> {
    return this.http.put<StoreSettingsDto>(`${this.baseUrl}/admin/settings`, payload);
  }

  // ==========================================================
  // UTILIDADES INTERNAS
  // ==========================================================

  private toHttpParams(params?: object): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }
}
