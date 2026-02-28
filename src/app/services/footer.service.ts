import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FooterData } from '../models/footer.model';
import { API_BASE_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class FooterService {

  private footerData: FooterData = {
    menuIzquierda: [ 
      { label: 'Acerca de este sitio web', ruta: '/about-this-website/' },
      { label: 'Cookies', ruta: '/cookies/' },
      { label: 'Aviso legal', ruta: '/legal-notice/' },
      { label: 'Privacidad de datos', ruta: '/data-privacy/' }
    ],
    noticias: [
      { fecha: '2022-02-25', titulo: 'Terelion es expositor en Minexchange 2022 SME Annual Conference & Expo', url: '#' },
      { fecha: '2020-10-19', titulo: 'Terelion estará en MINExpo 2021', url: '#' },
      { fecha: '2020-10-19', titulo: 'Síguenos en nuestras redes sociales', url: '#' }
    ],
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

  public footerData$ = new BehaviorSubject<FooterData>(this.getFooter());

  constructor(private http: HttpClient) {
    this.loadFromBackend();
  }

  getFooter(): FooterData {
    const saved = localStorage.getItem('footerData');
    return saved ? JSON.parse(saved) : this.footerData;
  }

  updateFooter(data: FooterData) {
    this.footerData = data;
    localStorage.setItem('footerData', JSON.stringify(data));
    this.footerData$.next(this.getFooter());

    // ✅ Sin token manual — el interceptor lo agrega automáticamente
    this.http.put(`${API_BASE_URL}/footer`, { content: data }).toPromise().catch(() => {});
  }

  private async loadFromBackend(): Promise<void> {
    try {
      const res = await this.http.get<any>(`${API_BASE_URL}/footer`).toPromise();
      const content = res?.content as FooterData | undefined;
      if (content) {
        this.footerData = content;
        localStorage.setItem('footerData', JSON.stringify(content));
        this.footerData$.next(this.footerData);
      }
    } catch {}
  }
}