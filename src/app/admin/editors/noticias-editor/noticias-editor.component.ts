import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';

import { NoticiasService } from '../../../services/noticias.service';
import { Noticia, ParrafoItem } from '../../../models/noticias.model';

@Component({
  selector: 'app-noticias-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatSelectModule,
    MatDividerModule
  ],
  templateUrl: './noticias-editor.component.html',
  styleUrls: ['./noticias-editor.component.css']
})
export class NoticiasEditorComponent implements OnInit {
  readonly document = document;

  // Lista de todas las noticias
  todasLasNoticias: Noticia[] = [];
  noticiaSeleccionadaId: number | null = null;

  noticia: Noticia = this.noticiaVacia();
  noticiaOriginal!: Noticia;
  showSuccessMessage = false;
  showDeleteConfirm = false;

  private imageFiles: Map<number, File> = new Map();

  constructor(private noticiasService: NoticiasService) {}

  ngOnInit() {
    // Suscribirse a la lista completa
    this.noticiasService.getTodasLasNoticias().subscribe(todas => {
      this.todasLasNoticias = todas;

      // Si viene draft del footer editor
      const draft = this.noticiasService.getDraft();
      if (draft) {
        const encontrada = todas.find(n => n.titulo === draft.titulo);
        if (encontrada) {
          this.seleccionarNoticia(encontrada.id);
        } else {
          // Crear nueva con el draft
          const nueva = this.noticiasService.crearNuevaNoticia();
          nueva.titulo = draft.titulo;
          nueva.fechaPublicacion = draft.fechaPublicacion;
          this.noticia = nueva;
          this.noticiaOriginal = JSON.parse(JSON.stringify(nueva));
          this.noticiaSeleccionadaId = null;
        }
        this.noticiasService.clearDraft();
        return;
      }

      // Si hay noticias y no hay ninguna seleccionada, seleccionar la primera
      if (todas.length > 0 && !this.noticiaSeleccionadaId) {
        this.seleccionarNoticia(todas[0].id);
      }
    });
  }

  // ✅ Cambia visibilidad y guarda inmediatamente
toggleVisibilidad() {
  this.noticia.visible = this.noticia.visible === false ? true : false;
  this.noticiasService.updateNoticia(this.noticia);
  this.noticiaOriginal = JSON.parse(JSON.stringify(this.noticia));
}
  noticiaVacia(): Noticia {
    return {
      id: 0,
      categoria: '',
      titulo: '',
      fechaPublicacion: new Date().toISOString().split('T')[0],
      parrafos: [],
      contactoNombre: '',
      contactoEmail: '',
      firmaNombre: '',
      firmaCargo: ''
    };
  }

  seleccionarNoticia(id: number) {
    const encontrada = this.todasLasNoticias.find(n => n.id === id);
    if (!encontrada) return;
    this.noticiaSeleccionadaId = id;
    this.noticia = JSON.parse(JSON.stringify(encontrada));
    this.noticiaOriginal = JSON.parse(JSON.stringify(encontrada));
    this.imageFiles.clear();
    this.showDeleteConfirm = false;
  }

  onSelectorChange(id: number) {
    this.seleccionarNoticia(id);
  }

  nuevaNoticia() {
    const nueva = this.noticiasService.crearNuevaNoticia();
    this.noticia = nueva;
    this.noticiaOriginal = JSON.parse(JSON.stringify(nueva));
    this.noticiaSeleccionadaId = null;
    this.imageFiles.clear();
    this.showDeleteConfirm = false;
  }

  eliminarNoticia() {
    if (!this.noticiaSeleccionadaId) return;
    this.noticiasService.eliminarNoticia(this.noticiaSeleccionadaId);
    this.noticiaSeleccionadaId = null;
    this.noticia = this.noticiaVacia();
    this.showDeleteConfirm = false;
  }

  // ─── Helpers tipo ─────────────────────────────────────────────────────────
  isTexto(item: ParrafoItem): item is { tipo: 'texto'; contenido: string } {
    return item.tipo === 'texto';
  }
  isImagen(item: ParrafoItem): item is { tipo: 'imagen'; url: string; alt?: string } {
    return item.tipo === 'imagen';
  }
  getContenido(item: ParrafoItem): string {
    return item.tipo === 'texto' ? item.contenido : '';
  }
  setContenido(item: ParrafoItem, value: string) {
    if (item.tipo === 'texto') item.contenido = value;
  }
  getImageUrl(item: ParrafoItem): string { return item.tipo === 'imagen' ? item.url : ''; }
  setImageAlt(item: ParrafoItem, value: string) { if (item.tipo === 'imagen') item.alt = value; }
  getImageAlt(item: ParrafoItem): string { return item.tipo === 'imagen' ? (item.alt ?? '') : ''; }

  // ─── Párrafos ─────────────────────────────────────────────────────────────
  agregarParrafo(posicion?: number) {
    const nuevo: ParrafoItem = { tipo: 'texto', contenido: '' };
    posicion !== undefined
      ? this.noticia.parrafos.splice(posicion + 1, 0, nuevo)
      : this.noticia.parrafos.push(nuevo);
  }

  agregarImagen(posicion?: number) {
    const nuevo: ParrafoItem = { tipo: 'imagen', url: '', alt: '' };
    posicion !== undefined
      ? this.noticia.parrafos.splice(posicion + 1, 0, nuevo)
      : this.noticia.parrafos.push(nuevo);
  }

  eliminarItem(index: number) {
    this.noticia.parrafos.splice(index, 1);
    this.imageFiles.delete(index);
  }

  moverArriba(index: number) {
    if (index === 0) return;
    const arr = this.noticia.parrafos;
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
  }

  moverAbajo(index: number) {
    const arr = this.noticia.parrafos;
    if (index === arr.length - 1) return;
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
  }

  onImageSelected(index: number, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.imageFiles.set(index, file);
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const item = this.noticia.parrafos[index];
      if (item.tipo === 'imagen') item.url = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  onDragOver(event: DragEvent) { event.preventDefault(); }

  onDropImage(index: number, event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    this.imageFiles.set(index, file);
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const item = this.noticia.parrafos[index];
      if (item.tipo === 'imagen') item.url = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  trackByIndex(index: number): number { return index; }

guardarCambios() {
  // ✅ Fecha = hoy si es nueva noticia, mantener la original si ya existe
  if (!this.noticia.fechaPublicacion || this.noticia.id === 0) {
    this.noticia.fechaPublicacion = new Date().toISOString().split('T')[0];
  }

  if (!this.noticia.id || this.noticia.id === 0) {
    const nueva = this.noticiasService.crearNuevaNoticia();
    this.noticia.id = nueva.id;
  }

  this.noticiasService.updateNoticia(this.noticia);
  this.noticiaSeleccionadaId = this.noticia.id;
  this.showSuccessMessage = true;
  setTimeout(() => this.showSuccessMessage = false, 3000);
  this.noticiaOriginal = JSON.parse(JSON.stringify(this.noticia));
}

  resetForm() {
    this.noticia = JSON.parse(JSON.stringify(this.noticiaOriginal));
    this.imageFiles.clear();
    this.showDeleteConfirm = false;
  }
}