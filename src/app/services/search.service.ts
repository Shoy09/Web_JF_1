import { Injectable } from '@angular/core';
import { NoticiasService } from './noticias.service';
import { NavbarService } from './navbar.service';

export interface SearchResult {
  tipo: 'noticia' | 'producto';
  titulo: string;
  descripcion?: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class SearchService {

  constructor(
    private noticiasService: NoticiasService,
    private navbarService: NavbarService
  ) {}

  buscar(query: string): SearchResult[] {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    const resultados: SearchResult[] = [];

    // ─── Buscar en noticias ───────────────────────────────────────────────
    const noticias = this.noticiasService['todasSubject'].getValue();
    noticias
      .filter(n => n.visible !== false)
      .forEach(n => {
        if (n.titulo.toLowerCase().includes(q)) {
          resultados.push({
            tipo: 'noticia',
            titulo: n.titulo,
            descripcion: n.fechaPublicacion,
            url: `/noticias/${n.slug || n.id}`
          });
        }
      });

    // ─── Buscar en productos ──────────────────────────────────────────────
    const navbar = this.navbarService.getNavbar();
    navbar.productosMenu?.forEach((categoria: any) => {
      categoria.items?.forEach((item: any) => {
        if (item.nombre.toLowerCase().includes(q)) {
          resultados.push({
            tipo: 'producto',
            titulo: item.nombre,
            descripcion: categoria.titulo,
            url: item.ruta
          });
        }
      });
      // También buscar en el título de la categoría
      if (categoria.titulo?.toLowerCase().includes(q)) {
        resultados.push({
          tipo: 'producto',
          titulo: categoria.titulo,
          descripcion: 'Categoría de productos',
          url: categoria.ruta
        });
      }
    });

    return resultados;
  }
}