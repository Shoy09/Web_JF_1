import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GeneralProductData } from '../models/general-product';
import { API_BASE_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class GeneralProductService {

  private readonly API = `${API_BASE_URL}/general-product-page`;
  private selectedKey: string | null = null;

  private cache: Record<string, GeneralProductData> = {};

  constructor(private http: HttpClient) {}

  // ─── Selección activa ─────────────────────────────────────────────────────

  selectCategory(ruta: string): void {
    this.selectedKey = ruta;
  }

  getSelectedKey(): string | null {
    return this.selectedKey;
  }

  // ─── Carga desde backend ──────────────────────────────────────────────────

  async fetchDataForKey(ruta: string): Promise<GeneralProductData> {
    const data = await firstValueFrom(
      this.http.get<GeneralProductData>(this.API, {
        params: { categoryKey: ruta }
      })
    );
    this.cache[ruta] = data;
    return data;
  }

  getDataForKey(ruta: string): GeneralProductData {
    return this.cache[ruta] ?? {
      headerData: { titulo: '', descripcion: '', breadcrumbs: [] },
      infoSection: { texto: '', boton: { label: '', link: '' } },
      products: []
    };
  }

  // ─── Guardar en backend ───────────────────────────────────────────────────

  async updateDataForKey(ruta: string, data: GeneralProductData): Promise<void> {
    const updated = await firstValueFrom(
      this.http.put<GeneralProductData>(this.API, data, {
        params: { categoryKey: ruta }
      })
    );
    this.cache[ruta] = updated;
  }

  // ─── Eliminar en backend ──────────────────────────────────────────────────

  async deleteDataForKey(ruta: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(this.API, {
        params: { categoryKey: ruta }
      })
    );
    delete this.cache[ruta];
  }
}