// mas-info-editor.component.ts
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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MasInfoService } from '../../../services/mas-info.service';
import { MasInfoData } from '../../../models/masinfo.model';

@Component({
  selector: 'app-mas-info-editor',
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
    MatExpansionModule,
    MatTooltipModule,
    MatCheckboxModule
  ],
  templateUrl: './mas-info-editor.component.html',
  styleUrls: ['./mas-info-editor.component.css']
})
export class MasInfoEditorComponent implements OnInit {
  data!: MasInfoData;
  originalData!: MasInfoData;
  showSuccessMessage = false;

  constructor(private masInfoService: MasInfoService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.data = this.masInfoService.getData();
    this.originalData = JSON.parse(JSON.stringify(this.data));
    
    // Inicializar arrays si no existen
    if (!this.data.contentSections) this.data.contentSections = [];
    if (!this.data.sections) this.data.sections = [];
  }

  trackByIndex(index: number): number {
    return index;
  }

  // ================= HERO =================
  addHeroButton(): void {
    this.data.hero.boton = { label: '', url: '' };
  }

  removeHeroButton(): void {
    delete this.data.hero.boton;
  }

  // ================= CONTENT SECTIONS =================
  addContentSection(): void {
    this.data.contentSections.push({
      titulo: '',
      parrafos: [''],
      imagen: '',
      reverse: false
    });
  }

  removeContentSection(index: number): void {
    this.data.contentSections.splice(index, 1);
  }

  addContentParagraph(sectionIndex: number): void {
    this.data.contentSections[sectionIndex].parrafos.push('');
  }

  removeContentParagraph(sectionIndex: number, paragraphIndex: number): void {
    this.data.contentSections[sectionIndex].parrafos.splice(paragraphIndex, 1);
  }

  updateContentParagraph(sectionIndex: number, paragraphIndex: number, event: any): void {
    this.data.contentSections[sectionIndex].parrafos[paragraphIndex] = event.target.value;
  }

  // ================= INFO SECTIONS =================
  addInfoSection(): void {
    this.data.sections.push({
      titulo: '',
      parrafos: [''],
      imagen: '',
      reverse: false
    });
  }

  removeInfoSection(index: number): void {
    this.data.sections.splice(index, 1);
  }

  addInfoParagraph(sectionIndex: number): void {
    this.data.sections[sectionIndex].parrafos.push('');
  }

  removeInfoParagraph(sectionIndex: number, paragraphIndex: number): void {
    this.data.sections[sectionIndex].parrafos.splice(paragraphIndex, 1);
  }

  updateInfoParagraph(sectionIndex: number, paragraphIndex: number, event: any): void {
    this.data.sections[sectionIndex].parrafos[paragraphIndex] = event.target.value;
  }

  // ================= BOTTOM BANNER =================
  addBottomBanner(): void {
    this.data.bottomBanner = {
      titulo: '',
      texto: '',
      imagen: ''
    };
  }

  removeBottomBanner(): void {
    delete this.data.bottomBanner;
  }

  // ================= GUARDAR =================
  save(): void {
    this.masInfoService.updateData(this.data);
    this.showSuccessMessage = true;
    setTimeout(() => this.showSuccessMessage = false, 3000);
    this.originalData = JSON.parse(JSON.stringify(this.data));
  }

  // ================= RESET =================
  resetForm(): void {
    this.data = JSON.parse(JSON.stringify(this.originalData));
  }
}