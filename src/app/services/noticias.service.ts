import { Injectable } from '@angular/core';
import { Noticia } from '../../app/models/noticias.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../api.config';

@Injectable({
  providedIn: 'root'
})
export class NoticiasService {

  private noticiaInicial: Noticia = {
    id: 1,
    categoria: 'NEWS /',
    titulo: 'TERELION WILL DISCONTINUE ITS OPERATIONS...',
    fechaPublicacion: '2024-06-14',
    parrafos: [
      'Terelion will discontinue its operations...',
      'We appreciate the support...'
    ],
    contactoNombre: 'Miguel Jahncke',
    contactoEmail: 'mjahncke@terelion.com',
    firmaNombre: 'Tommy Persson',
    firmaCargo: 'President, Terelion'
  };

  private noticiaSubject: BehaviorSubject<Noticia>;

  constructor(private http: HttpClient) {
    const noticiaGuardada = localStorage.getItem('noticia');
    const data = noticiaGuardada
      ? JSON.parse(noticiaGuardada)
      : this.noticiaInicial;

    this.noticiaSubject = new BehaviorSubject<Noticia>(data);
    this.loadFromBackend();
  }

  getNoticia(): Observable<Noticia> {
    return this.noticiaSubject.asObservable();
  }

  updateNoticia(nuevaNoticia: Noticia) {
    localStorage.setItem('noticia', JSON.stringify(nuevaNoticia));
    this.noticiaSubject.next(nuevaNoticia);
    const id = nuevaNoticia.id || 1;
    this.http.put(`${API_BASE_URL}/noticias/${id}`, nuevaNoticia).toPromise().catch(() => {});
  }

  private async loadFromBackend(): Promise<void> {
    try {
      const list = await this.http.get<Noticia[]>(`${API_BASE_URL}/noticias`).toPromise();
      const first = Array.isArray(list) && list.length ? list[0] : null;
      if (first) {
        localStorage.setItem('noticia', JSON.stringify(first));
        this.noticiaSubject.next(first);
      }
    } catch {}
  }
}
