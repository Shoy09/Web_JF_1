import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NoticiasService } from '../../services/noticias.service';
import { Noticia, ParrafoItem } from '../../models/noticias.model';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './noticias.component.html',
  styleUrl: './noticias.component.css'
})
export class NoticiasComponent implements OnInit {

  noticia: Noticia | null = null;
  noFound = false;

  constructor(
    private noticiasService: NoticiasService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Escuchar cambios de parámetro (por si navegan entre noticias)
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');

      if (slug) {
        // ✅ Buscar por slug en la lista
        this.noticiasService.getTodasLasNoticias().subscribe(todas => {
          const encontrada = todas.find(n => n.slug === slug);
          if (encontrada) {
            this.noticia = { ...encontrada };
            this.noFound = false;
          } else {
            this.noticia = null;
            this.noFound = true;
          }
        });
      } else {
        // Sin slug → mostrar la primera noticia
        this.noticiasService.getTodasLasNoticias().subscribe(todas => {
          if (todas.length > 0) {
            this.noticia = { ...todas[0] };
            this.noFound = false;
          } else {
            this.noticia = null;
            this.noFound = true;
          }
        });
      }
    });
  }

  isTexto(item: ParrafoItem): item is { tipo: 'texto'; contenido: string } {
    return item.tipo === 'texto';
  }

  isImagen(item: ParrafoItem): item is { tipo: 'imagen'; url: string; alt?: string } {
    return item.tipo === 'imagen';
  }

  trackByIndex(index: number): number {
    return index;
  }
}