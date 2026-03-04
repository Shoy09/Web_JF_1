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

    // ─── Noticias ─────────────────────────────────────────────────────────
    const noticias = this.noticiasService.getNoticias();
    noticias
      .filter(n => n.visible !== false)
      .forEach(n => {
        const enTitulo    = n.titulo?.toLowerCase().includes(q);
        const enCategoria = n.categoria?.toLowerCase().includes(q);
        if (enTitulo || enCategoria) {
          resultados.push({
            tipo: 'noticia',
            titulo: n.titulo,
            descripcion: n.fechaPublicacion,
            url: `/noticias/${n.slug || n.id}`
          });
        }
      });

    // ─── Productos ────────────────────────────────────────────────────────
    const navbar = this.navbarService.getNavbar();
    const productosMenu = navbar?.productosMenu ?? [];

    productosMenu.forEach((categoria: any) => {
      if (categoria.titulo?.toLowerCase().includes(q)) {
        resultados.push({
          tipo: 'producto',
          titulo: categoria.titulo,
          descripcion: 'Categoría de productos',
          url: categoria.ruta
        });
      }

      (categoria.items ?? []).forEach((item: any) => {
        if (item.nombre?.toLowerCase().includes(q)) {
          resultados.push({
            tipo: 'producto',
            titulo: item.nombre,
            descripcion: categoria.titulo,
            url: item.ruta
          });
        }
      });
    });

    return resultados;
  }
}