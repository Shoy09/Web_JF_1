import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Region, ContactPageContent } from '../models/contact.model';
import { API_BASE_URL } from '../api.config';



@Injectable({ providedIn: 'root' })
export class ContactService {

  private STORAGE_CONTENT = 'contact_content';
  private STORAGE_REGIONS = 'contact_regions';

  // =============================
  // DATA INICIAL (fallback)
  // =============================
  private defaultRegions: Region[] = [
    {
      value: 'south-america',
      label: 'Sudamérica',
      contact: {
        name: 'Miguel Jahncke',
        phones: ['+51 989 164 305 (Perú)', '+1 954 258 0271 (EE.UU.)'],
        email: 'mjahncke@terelion.com',
        office: {
          country: 'Perú',
          address: 'Terelion LLC. Sucursal del Perú, Las Poncianas #105, La Molina Vieja, Lima, Perú',
          phone: '+51-1-365-2529'
        }
      }
    }
  ];

  private defaultContent: ContactPageContent = {
    header: {
      subtitle: 'CONTÁCTANOS',
      title: 'SELECCIONA TU REGIÓN',
      selectHelp: 'Comienza a escribir para buscar tu región',
      regionLabel: 'País o Región',
      regionPlaceholder: 'Escribe para buscar...'
    },
    body: {
      leftTexts: [
        'Dondequiera que esté ubicada tu operación...',
        'Usa el menú desplegable para encontrar la oficina...'
      ],
      boldText: '¡Encuentra a tus contactos en tu región!',
      formFields: [
        { label: 'Nombre', placeholder: 'Ingresa tu nombre', required: true },
        { label: 'Apellido', placeholder: 'Ingresa tu apellido', required: true },
        { label: 'Correo', placeholder: 'correo@ejemplo.com', type: 'email', required: true },
        { label: 'Teléfono', placeholder: '+51...' },
        { label: 'Empresa', placeholder: 'Empresa' },
        { label: 'Mensaje', placeholder: 'Escribe...', rows: 6 }
      ],
      legalText: 'Texto legal...',
      sendButtonLabel: 'ENVIAR'
    }
  };

  // =============================
  // LOAD DESDE LOCALSTORAGE
  // =============================
  private loadContent(): ContactPageContent {
    const saved = localStorage.getItem(this.STORAGE_CONTENT);
    return saved ? JSON.parse(saved) : this.defaultContent;
  }

  private loadRegions(): Region[] {
    const saved = localStorage.getItem(this.STORAGE_REGIONS);
    return saved ? JSON.parse(saved) : this.defaultRegions;
  }

  private _content = this.loadContent();
  private _regions = this.loadRegions();

  // streams reactivos
  public content$ = new BehaviorSubject<ContactPageContent>(this._content);
  public regions$ = new BehaviorSubject<Region[]>(this._regions);

  constructor(private http: HttpClient) {
    this.loadFromBackend();
  }

  // =============================
  // UPDATE CONTENT
  // =============================
  updateContent(content: ContactPageContent) {
    this._content = JSON.parse(JSON.stringify(content));
    localStorage.setItem(this.STORAGE_CONTENT, JSON.stringify(this._content));
    this.content$.next(this._content);
    this.syncBackend().catch(() => {});
  }

  updateRegions(regions: Region[]) {
    this._regions = JSON.parse(JSON.stringify(regions));
    localStorage.setItem(this.STORAGE_REGIONS, JSON.stringify(this._regions));
    this.regions$.next(this._regions);
    this.syncBackend().catch(() => {});
  }

  // RESET TOTAL
  resetAll() {
    localStorage.removeItem(this.STORAGE_CONTENT);
    localStorage.removeItem(this.STORAGE_REGIONS);
    this._content = this.defaultContent;
    this._regions = this.defaultRegions;
    this.content$.next(this._content);
    this.regions$.next(this._regions);
  }

  // =============================
  // BACKEND SYNC
  // =============================
  private async loadFromBackend(): Promise<void> {
    try {
      const res = await this.http.get<any>(`${API_BASE_URL}/contact-page`).toPromise();
      const content = res?.content as ContactPageContent | undefined;
      const regions = res?.regions as Region[] | undefined;
      if (content) {
        this._content = content;
        localStorage.setItem(this.STORAGE_CONTENT, JSON.stringify(this._content));
        this.content$.next(this._content);
      }
      if (regions) {
        this._regions = regions;
        localStorage.setItem(this.STORAGE_REGIONS, JSON.stringify(this._regions));
        this.regions$.next(this._regions);
      }
    } catch {}
  }

  private async syncBackend(): Promise<void> {
    try {
      await this.http.put(`${API_BASE_URL}/contact-page`, {
        regions: this._regions,
        content: this._content
      }).toPromise();
    } catch {}
  }
}
