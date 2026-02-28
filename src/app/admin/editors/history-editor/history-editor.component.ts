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
    MatCheckboxModule
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

  activeTab: 'hero' | 'timeline' = 'hero';
  showSuccessMessage = false;

  constructor(private historyService: HistoryService){
    const serviceData = this.historyService.getData();
    if(serviceData){
      // CLONE PROFUNDO para editar sin romper referencia
      this.data = JSON.parse(JSON.stringify(serviceData));
      // Guardar copia para reset
      this.originalData = JSON.parse(JSON.stringify(serviceData));
    }
  }

  // ======================== GUARDAR ========================
  save(){
    this.historyService.update(this.data);
    // Actualizar la copia de respaldo después de guardar
    this.originalData = JSON.parse(JSON.stringify(this.data));
    this.showSuccessMessage = true;
    setTimeout(() => this.showSuccessMessage = false, 3000);
  }

  // ======================== RESET ========================
  resetForm(){
    // Restaurar desde la copia de respaldo
    this.data = JSON.parse(JSON.stringify(this.originalData));
  }

  // ======================== TIMELINE ========================
  addTimeline(){
    this.data.timeline.push({
      image:'',
      alt:'',
      stories:[{year:'', text:''}]
    });
  }

  deleteTimeline(i:number){
    this.data.timeline.splice(i,1);
  }

  // ======================== STORIES ========================
  addStory(i:number){
    this.data.timeline[i].stories.push({year:'', text:''});
  }

  deleteStory(i:number, j:number){
    this.data.timeline[i].stories.splice(j,1);
  }

}