import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FooterData } from '../models/footer.model';
import { NoticiasService } from './noticias.service';
import { API_BASE_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class FooterService {

  private footerBase: FooterData = {
    menuIzquierda: [
      { label: 'Acerca de este sitio web', ruta: '/about-this-website/' },
      { label: 'Cookies', ruta: '/cookies/' },
      { label: 'Aviso legal', ruta: '/legal-notice/' },
      { label: 'Privacidad de datos', ruta: '/data-privacy/' }
    ],
    noticias: [],
    logoCentro: '/logo-blanco.png',
    contacto: { telefono: '+14692944196', email: 'frank.rupay@jftriconperu.com' },
    redes: [
      { icon: 'bi bi-facebook', url: 'https://www.facebook.com/share/1BzmQ64ZW3/', nombre: 'Facebook' },
      { icon: 'bi bi-linkedin', url: 'https://www.linkedin.com/company/jf-tricon-perú', nombre: 'LinkedIn' },
      { icon: 'bi bi-instagram', url: 'https://www.instagram.com/terelion.mining/', nombre: 'Instagram' }
    ],
    followText: 'SÍGUENOS EN —',
    copyright: `© ${new Date().getFullYear()} - JF Tricon Perú, LLC`,
  };

  public footerData$ = new BehaviorSubject<FooterData>(this.getFooterBase());

  constructor(
    private http: HttpClient,
    private noticiasService: NoticiasService
  ) {
    this.loadFromBackend();
    this.sincronizarNoticias();
  }

  // ✅ Cada vez que cambia la lista de noticias (crear, editar, ELIMINAR)
  // se actualiza automáticamente el footer
private sincronizarNoticias(): void {
  this.noticiasService.getTodasLasNoticias().subscribe(noticias => {
    const current = this.footerData$.getValue();
    // ✅ Solo las que tienen visible !== false (undefined = visible por defecto)
    const noticiasFooter = noticias
      .filter(n => n.visible !== false)
      .map(n => ({
        fecha: n.fechaPublicacion,
        titulo: n.titulo,
        url: `/noticias/${n.slug || n.id}`
      }));
    this.footerData$.next({ ...current, noticias: noticiasFooter });
  });
}

  private getFooterBase(): FooterData {
    const saved = localStorage.getItem('footerData');
    return saved ? JSON.parse(saved) : this.footerBase;
  }

  getFooter(): FooterData {
    return this.footerData$.getValue();
  }

  updateFooter(data: FooterData) {
    // Al guardar footer manualmente NO sobreescribir noticias
    // ya que estas vienen del NoticiasService
    const noticiasActuales = this.footerData$.getValue().noticias;
    const dataConNoticias = { ...data, noticias: noticiasActuales };

    localStorage.setItem('footerData', JSON.stringify(dataConNoticias));
    this.footerData$.next(dataConNoticias);
    this.http.put(`${API_BASE_URL}/footer`, { content: dataConNoticias }).toPromise().catch(() => {});
  }

  private async loadFromBackend(): Promise<void> {
    try {
      const res = await this.http.get<any>(`${API_BASE_URL}/footer`).toPromise();
      const content = res?.content as FooterData | undefined;
      if (content) {
        // No restaurar noticias del backend, las maneja NoticiasService
        const { noticias, ...resto } = content;
        const current = this.footerData$.getValue();
        this.footerData$.next({ ...current, ...resto });
        localStorage.setItem('footerData', JSON.stringify({ ...current, ...resto }));
      }
    } catch {}
  }
}