// history-editor.component.ts
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HistoryService } from '../../../services/history.service';
import { HistoryData } from '../../../models/history.model';
import { CommonModule } from '@angular/common';

// Angular Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-history-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatExpansionModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './history-editor.component.html',
  styleUrls: ['./history-editor.component.css']
})
export class HistoryEditorComponent {

  data: HistoryData = {
    heroTitle: '',
    timeline: []
  };

  // Copia de respaldo para el reset
  private originalData: HistoryData = {
    heroTitle: '',
    timeline: []
  };

  // Track de archivos e imágenes por bloque
  private timelineImageFiles: (File | null)[] = [];
  timelineImageFileNames: string[] = [];
  timelineImagePreviews: (string | null)[] = [];

  activeTab: 'hero' | 'timeline' = 'hero';
  showSuccessMessage = false;
  errorMessage: string | null = null;
  isLoading = false;

  constructor(private historyService: HistoryService){
    const serviceData = this.historyService.getData();
    if(serviceData){
      // CLONE PROFUNDO para editar sin romper referencia
      this.data = JSON.parse(JSON.stringify(serviceData));
      // Guardar copia para reset
      this.originalData = JSON.parse(JSON.stringify(serviceData));

      // Inicializar arrays de imágenes
      this.timelineImageFiles = this.data.timeline.map(() => null);
      this.timelineImageFileNames = this.data.timeline.map(() => '');
      this.timelineImagePreviews = this.data.timeline.map(t => t.image || null);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  // Método para hacer click en inputs dinámicos por ID
  selectFileById(id: string): void {
    const element = document.getElementById(id) as HTMLInputElement;
    if (element) {
      element.click();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TIMELINE IMAGE UPLOADS
  // ═══════════════════════════════════════════════════════════════════════

  onTimelineImageSelected(timelineIndex: number, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.timelineImageFiles[timelineIndex] = file;
      this.timelineImageFileNames[timelineIndex] = file.name;
      this.previewImage(file, timelineIndex);
    }
  }

  onTimelineImageDrop(timelineIndex: number, event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.timelineImageFiles[timelineIndex] = file;
      this.timelineImageFileNames[timelineIndex] = file.name;
      this.previewImage(file, timelineIndex);
    }
  }

  private previewImage(file: File, timelineIndex: number): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.timelineImagePreviews[timelineIndex] = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ======================== GUARDAR ========================
  async save(){
    this.isLoading = true;
    this.errorMessage = null;

    try {
      // Subir imágenes base64 a Cloudinary (fuera del save)
      for (let i = 0; i < this.data.timeline.length; i++) {
        if (this.timelineImageFiles[i]) {
          const url = await this.historyService.uploadImage(
            this.timelineImageFiles[i]!,
            `history_timeline_${i}`
          );
          this.data.timeline[i].image = url;
          this.timelineImageFiles[i] = null;
        }
      }

      // Guardar en base de datos
      this.historyService.update(this.data);
      // Actualizar la copia de respaldo después de guardar
      this.originalData = JSON.parse(JSON.stringify(this.data));
      this.showSuccessMessage = true;
      setTimeout(() => this.showSuccessMessage = false, 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al guardar. Intenta de nuevo.';
      console.error('Error al guardar:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // ======================== RESET ========================
  resetForm(){
    // Restaurar desde la copia de respaldo
    this.data = JSON.parse(JSON.stringify(this.originalData));
    
    // Limpiar previsualizaciones
    this.timelineImageFiles = this.data.timeline.map(() => null);
    this.timelineImageFileNames = this.data.timeline.map(() => '');
    this.timelineImagePreviews = this.data.timeline.map(t => t.image || null);
    
    this.errorMessage = null;
  }

  // ======================== TIMELINE ========================
  addTimeline(){
    this.data.timeline.push({
      image:'',
      alt:'',
      stories:[{year:'', text:''}]
    });
    this.timelineImageFiles.push(null);
    this.timelineImageFileNames.push('');
    this.timelineImagePreviews.push(null);
  }

  deleteTimeline(i:number){
    this.data.timeline.splice(i,1);
    this.timelineImageFiles.splice(i, 1);
    this.timelineImageFileNames.splice(i, 1);
    this.timelineImagePreviews.splice(i, 1);
  }

  // ======================== STORIES ========================
  addStory(i:number){
    this.data.timeline[i].stories.push({year:'', text:''});
  }

  deleteStory(i:number, j:number){
    this.data.timeline[i].stories.splice(j,1);
  }

}