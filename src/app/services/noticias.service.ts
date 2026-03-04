import { Injectable } from '@angular/core';
import { Noticia, ParrafoItem } from '../models/noticias.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class NoticiasService {

  private noticiaInicial: Noticia = {
    id: 1,
    categoria: 'NEWS /',
    titulo: 'TERELION WILL DISCONTINUE ITS OPERATIONS...',
    fechaPublicacion: '2024-06-14',
    slug: '2024-06-14-terelion-will-discontinue-its-operations',
    parrafos: [
      { tipo: 'texto', contenido: 'Terelion will discontinue its operations...' },
      { tipo: 'texto', contenido: 'We appreciate the support...' }
    ],
    contactoNombre: 'Miguel Jahncke',
    contactoEmail: 'mjahncke@terelion.com',
    firmaNombre: 'Tommy Persson',
    firmaCargo: 'President, Terelion'
  };

  private noticiaSubject: BehaviorSubject<Noticia>;
  private todasSubject: BehaviorSubject<Noticia[]>;
  private draft: { titulo: string; fechaPublicacion: string } | null = null;

  constructor(private http: HttpClient) {
    const noticiaGuardada = localStorage.getItem('noticia');
    let data: Noticia = noticiaGuardada
      ? this.migrateParrafos(JSON.parse(noticiaGuardada))
      : this.noticiaInicial;

    this.noticiaSubject = new BehaviorSubject<Noticia>(data);

    const todasGuardadas = localStorage.getItem('todasNoticias');
    const todas: Noticia[] = todasGuardadas
      ? JSON.parse(todasGuardadas)
      : [data];
    this.todasSubject = new BehaviorSubject<Noticia[]>(todas);

    this.loadFromBackend();
  }

  private migrateParrafos(noticia: any): Noticia {
    if (Array.isArray(noticia.parrafos) && noticia.parrafos.length > 0) {
      if (typeof noticia.parrafos[0] === 'string') {
        noticia.parrafos = noticia.parrafos.map((p: string) => ({ tipo: 'texto', contenido: p }));
      }
    }
    return noticia as Noticia;
  }

  toSlug(titulo: string, fecha: string): string {
    const slugTitulo = titulo.trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    return `${fecha}-${slugTitulo}`;
  }

  getNoticia(): Observable<Noticia> {
    return this.noticiaSubject.asObservable();
  }

  getTodasLasNoticias(): Observable<Noticia[]> {
    return this.todasSubject.asObservable();
  }

  // ✅ Buscar noticia por slug
  getNoticiaBySlug(slug: string): Noticia | undefined {
    return this.todasSubject.getValue().find(n => n.slug === slug);
  }

  getNoticiaById(id: number): Noticia | undefined {
    return this.todasSubject.getValue().find(n => n.id === id);
  }

  updateNoticia(nuevaNoticia: Noticia) {
    // ✅ Siempre recalcular slug desde título y fecha
    nuevaNoticia.slug = this.toSlug(nuevaNoticia.titulo, nuevaNoticia.fechaPublicacion);

    const todas = this.todasSubject.getValue();
    const idx = todas.findIndex(n => n.id === nuevaNoticia.id);
    if (idx >= 0) {
      todas[idx] = nuevaNoticia;
    } else {
      todas.push(nuevaNoticia);
    }

    localStorage.setItem('todasNoticias', JSON.stringify(todas));
    localStorage.setItem('noticia', JSON.stringify(nuevaNoticia));
    this.todasSubject.next([...todas]);
    this.noticiaSubject.next(nuevaNoticia);

    this.http.put(`${API_BASE_URL}/noticias/${nuevaNoticia.id}`, nuevaNoticia).toPromise().catch(() => {});
  }

  crearNuevaNoticia(): Noticia {
    const todas = this.todasSubject.getValue();
    const maxId = todas.length ? Math.max(...todas.map(n => n.id)) : 0;
    return {
      id: maxId + 1,
      categoria: '',
      titulo: '',
      fechaPublicacion: new Date().toISOString().split('T')[0],
      parrafos: [],
      contactoNombre: '',
      contactoEmail: '',
      firmaNombre: '',
      firmaCargo: '',
      slug: ''
    };
  }

  eliminarNoticia(id: number) {
    const todas = this.todasSubject.getValue().filter(n => n.id !== id);
    localStorage.setItem('todasNoticias', JSON.stringify(todas));
    this.todasSubject.next([...todas]);
    this.http.delete(`${API_BASE_URL}/noticias/${id}`).toPromise().catch(() => {});
  }

  setDraft(titulo: string, fechaPublicacion: string): void {
    this.draft = { titulo, fechaPublicacion };
  }

  getDraft(): { titulo: string; fechaPublicacion: string } | null {
    return this.draft;
  }

  clearDraft(): void {
    this.draft = null;
  }

  private async loadFromBackend(): Promise<void> {
    try {
      const list = await this.http.get<any[]>(`${API_BASE_URL}/noticias`).toPromise();
      if (Array.isArray(list) && list.length) {
        const migradas = list.map(n => {
          const m = this.migrateParrafos(n);
          // Migrar slug si no tiene
          if (!m.slug && m.titulo && m.fechaPublicacion) {
            m.slug = this.toSlug(m.titulo, m.fechaPublicacion);
          }
          return m;
        });
        localStorage.setItem('todasNoticias', JSON.stringify(migradas));
        this.todasSubject.next(migradas);
        localStorage.setItem('noticia', JSON.stringify(migradas[0]));
        this.noticiaSubject.next(migradas[0]);
      }
    } catch {}
  }
  getNoticias(): Noticia[] {
  return this.todasSubject.getValue();
}
}