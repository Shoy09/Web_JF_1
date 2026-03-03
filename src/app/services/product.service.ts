import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HeroProduct } from '../models/product.model';
import { API_BASE_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class ProductService {

  private readonly API = `${API_BASE_URL}/products`;
  private selectedCategoryKey: string | null = null;
  private selectedKey: string | null = null;

  private cache: Record<string, HeroProduct> = {};
  private categoryProductsMap: Record<string, { nombre: string; ruta: string }[]> = {};

  constructor(private http: HttpClient) {}

  // ─── Selección activa ─────────────────────────────────────────────────────

  selectCategory(ruta: string): void { this.selectedCategoryKey = ruta; }
  getSelectedCategoryKey(): string | null { return this.selectedCategoryKey; }
  selectProduct(ruta: string): void { this.selectedKey = ruta; }
  getSelectedKey(): string | null { return this.selectedKey; }

  // ─── Productos por categoría ──────────────────────────────────────────────

  setCategoryProductsMap(map: Record<string, { nombre: string; ruta: string }[]>): void {
    this.categoryProductsMap = map;
  }

  getProductsForCategory(categoryRuta: string): { nombre: string; ruta: string }[] {
    return this.categoryProductsMap[categoryRuta] ?? [];
  }

  // ─── Carga desde backend ──────────────────────────────────────────────────

  async fetchProductForKey(ruta: string): Promise<HeroProduct> {
    const product = await firstValueFrom(
      this.http.get<HeroProduct>(`${this.API}/by-ruta`, { params: { ruta } })
      // Token lo inyecta el AuthInterceptor automáticamente
    );
    this.cache[ruta] = product;
    return product;
  }

  getProductForKey(ruta: string): HeroProduct {
    return this.cache[ruta] ?? {
      ruta, title: '', subtitle: '', descriptions: [],
      mainImage: '', thumbnails: [], contactLink: '',
      breadcrumbs: [], features: [], downloads: []
    };
  }

  // ─── Guardar en backend ───────────────────────────────────────────────────

  async updateProductForKey(
    ruta: string,
    product: HeroProduct,
    downloadFiles: (File | null)[],
    mainImageFile: File | null,
    thumbnailFiles: (File | null)[]
  ): Promise<void> {
    let mainImageBase64: string | null = null;
    if (mainImageFile) mainImageBase64 = await this.fileToBase64(mainImageFile);

    const thumbnailsBase64 = await Promise.all(
      thumbnailFiles.map(f => f ? this.fileToBase64(f) : Promise.resolve(null))
    );

    const downloadsBase64 = await Promise.all(
      downloadFiles.map(f => f ? this.fileToBase64(f) : Promise.resolve(null))
    );

    const downloadsFileNames = downloadFiles.map(f => f ? f.name : null);

    const payload = {
      ruta,
      title:           product.title,
      subtitle:        product.subtitle,
      descriptions:    product.descriptions,
      mainImage:       product.mainImage,
      mainImageBase64,
      thumbnails:      product.thumbnails,
      thumbnailsBase64,
      contactLink:     product.contactLink,
      breadcrumbs:     product.breadcrumbs,
      features:        product.features,
      downloads:       product.downloads,
      downloadsBase64,
      downloadsFileNames
    };

    const updated = await firstValueFrom(
      this.http.put<HeroProduct>(`${this.API}/by-ruta`, payload, { params: { ruta } })
      // Token lo inyecta el AuthInterceptor automáticamente
    );

    this.cache[ruta] = updated;
  }

  // ✅ NUEVO: Eliminar producto del backend por ruta
  async deleteProductByRuta(ruta: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.API}/by-ruta`, { params: { ruta } })
      // Token lo inyecta el AuthInterceptor automáticamente
    );
    // Limpiar cache local
    delete this.cache[ruta];
  }

  // ─── Utilidades ───────────────────────────────────────────────────────────

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  }
}