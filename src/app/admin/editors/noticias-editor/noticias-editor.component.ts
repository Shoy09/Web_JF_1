// noticias-editor.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NoticiasService } from '../../../services/noticias.service';
import { Noticia } from '../../../models/noticias.model';

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
    MatTooltipModule
  ],
  templateUrl: './noticias-editor.component.html',
  styleUrls: ['./noticias-editor.component.css']
})
export class NoticiasEditorComponent implements OnInit {
  noticia: Noticia = {
    id: 0,
    categoria: '',
    titulo: '',
    fechaPublicacion: '',
    parrafos: [],
    contactoNombre: '',
    contactoEmail: '',
    firmaNombre: '',
    firmaCargo: ''
  };

  noticiaOriginal!: Noticia;
  showSuccessMessage = false;

  constructor(private noticiasService: NoticiasService) { }

  ngOnInit() {
    this.loadData();
  }

  loadData(): void {
    this.noticiasService.getNoticia().subscribe(data => {
      this.noticia = { ...data };
      this.noticiaOriginal = JSON.parse(JSON.stringify(data));
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  // ================= PÁRRAFOS =================
  agregarParrafo() {
    this.noticia.parrafos.push('');
  }

  eliminarParrafo(index: number) {
    this.noticia.parrafos.splice(index, 1);
  }

  // ================= GUARDAR =================
  guardarCambios() {
    this.noticiasService.updateNoticia(this.noticia);
    this.showSuccessMessage = true;
    setTimeout(() => this.showSuccessMessage = false, 3000);
    this.noticiaOriginal = JSON.parse(JSON.stringify(this.noticia));
  }

  // ================= RESET =================
  resetForm() {
    this.noticia = JSON.parse(JSON.stringify(this.noticiaOriginal));
  }
}