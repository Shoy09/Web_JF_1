import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importante para el [(ngModel)]
import { NoticiasService } from '../../services/noticias.service';
import { Noticia } from '../../models/noticias.model';
 
@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './noticias.component.html',
  styleUrl: './noticias.component.css'
})
export class NoticiasComponent implements OnInit {
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
  
  editando: boolean = false;

  constructor(private noticiasService: NoticiasService) {}

  ngOnInit() {
    this.noticiasService.getNoticia().subscribe(data => {
      this.noticia = { ...data };
    });
  }

  toggleEdit() {
    if (this.editando) {
      this.noticiasService.updateNoticia(this.noticia);
    }
    this.editando = !this.editando;
  }

  // Helper para trackear párrafos en el editor
  trackByIndex(index: number): number {
    return index;
  }
}