import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NavbarData } from '../models/navbar.model';
import { API_BASE_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class NavbarService {

  private navbarData: NavbarData = {
    productosLabel: 'Productos',
    aboutLabel: 'Acerca de',
    contactoLabel: 'Contacto',
    contactoRuta: '/contactos',
    siguenos: 'Síguenos en',
    buscarPlaceholder: 'Buscar en terelion.com...',
    aboutMenu: [
      { nombre: 'Nosotros', ruta: '/acerca-de' },
      { nombre: 'Nuestra Historia', ruta: '/his' }
    ],
    productosMenu: [
      {
        titulo: 'Brocas Tricónicas', ruta: '/productos/general',
        items: [
          { nombre: 'RIDGEBACK™ – Perforación en roca dura', ruta: '/productos' },
          { nombre: 'AVENGER™ – Perforación de alto rendimiento', ruta: '/productos' }
        ]
      }
    ],
    redes: [
      { nombre: 'facebook', icon: 'bi bi-facebook', url: 'https://www.facebook.com/share/1BzmQ64ZW3/' },
      { nombre: 'linkedin', icon: 'bi bi-linkedin', url: 'https://www.linkedin.com/company/jf-tricon-per%C3%BA/' }
    ],
    logoActual: '/logo-blanco.png'
  };

  private navbarSubject = new BehaviorSubject<NavbarData>(this.getNavbar());
  public navbarData$ = this.navbarSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFromBackend();
  }

  getNavbar(): NavbarData {
    const saved = localStorage.getItem('navbarData');
    return saved ? JSON.parse(saved) : this.navbarData;
  }

updateNavbar(data: NavbarData) {
  this.navbarData = data;
  localStorage.setItem('navbarData', JSON.stringify(data));
  this.navbarSubject.next(data);

  this.http.put(`${API_BASE_URL}/navbar`, data).toPromise().catch(() => {});
}

  private async loadFromBackend(): Promise<void> {
    try {
      const res = await this.http.get<NavbarData>(`${API_BASE_URL}/navbar`).toPromise();
      if (res) {
        this.navbarData = res;
        localStorage.setItem('navbarData', JSON.stringify(res));
        this.navbarSubject.next(res);
      }
    } catch {}
  }
}
