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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './mas-info-editor.component.html',
  styleUrls: ['./mas-info-editor.component.css']
})
export class MasInfoEditorComponent implements OnInit {
  data!: MasInfoData;
  originalData!: MasInfoData;
  showSuccessMessage = false;
  errorMessage: string | null = null;
  isLoading = false;

  // Track de archivos e imágenes por sección
  private heroImageFile: File | null = null;
  private contentImageFiles: (File | null)[] = [];
  private infoImageFiles: (File | null)[] = [];
  private bannerImageFile: File | null = null;

  // Track de nombres de archivo
  heroImageFileName = '';
  contentImageFileNames: string[] = [];
  infoImageFileNames: string[] = [];
  bannerImageFileName = '';

  // Track de imágenes en preview
  heroImagePreview: string | null = null;
  contentImagePreviews: (string | null)[] = [];
  infoImagePreviews: (string | null)[] = [];
  bannerImagePreview: string | null = null;

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

    // Inicializar previsualizaciones
    this.heroImagePreview = this.data.hero.imagenFondo || null;
    this.contentImagePreviews = this.data.contentSections.map(s => s.imagen || null);
    this.infoImagePreviews = this.data.sections.map(s => s.imagen || null);
    this.bannerImagePreview = this.data.bottomBanner?.imagen || null;
  }

  trackByIndex(index: number): number {
    return index;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // HERO SECTION
  // ═══════════════════════════════════════════════════════════════════════

  addHeroButton(): void {
    this.data.hero.boton = { label: '', url: '' };
  }

  removeHeroButton(): void {
    delete this.data.hero.boton;
  }

  onHeroImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.heroImageFile = file;
      this.heroImageFileName = file.name;
      this.previewImage(file, 'hero');
    }
  }

  onHeroImageDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.heroImageFile = file;
      this.heroImageFileName = file.name;
      this.previewImage(file, 'hero');
    }
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
  // CONTENT SECTIONS
  // ═══════════════════════════════════════════════════════════════════════

  addContentSection(): void {
    this.data.contentSections.push({
      titulo: '',
      parrafos: [''],
      imagen: '',
      reverse: false
    });
    this.contentImageFiles.push(null);
    this.contentImageFileNames.push('');
    this.contentImagePreviews.push(null);
  }

  removeContentSection(index: number): void {
    this.data.contentSections.splice(index, 1);
    this.contentImageFiles.splice(index, 1);
    this.contentImageFileNames.splice(index, 1);
    this.contentImagePreviews.splice(index, 1);
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

  onContentImageSelected(sectionIndex: number, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.contentImageFiles[sectionIndex] = file;
      this.contentImageFileNames[sectionIndex] = file.name;
      this.previewImage(file, 'content', sectionIndex);
    }
  }

  onContentImageDrop(sectionIndex: number, event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.contentImageFiles[sectionIndex] = file;
      this.contentImageFileNames[sectionIndex] = file.name;
      this.previewImage(file, 'content', sectionIndex);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // INFO SECTIONS
  // ═══════════════════════════════════════════════════════════════════════

  addInfoSection(): void {
    this.data.sections.push({
      titulo: '',
      parrafos: [''],
      imagen: '',
      reverse: false
    });
    this.infoImageFiles.push(null);
    this.infoImageFileNames.push('');
    this.infoImagePreviews.push(null);
  }

  removeInfoSection(index: number): void {
    this.data.sections.splice(index, 1);
    this.infoImageFiles.splice(index, 1);
    this.infoImageFileNames.splice(index, 1);
    this.infoImagePreviews.splice(index, 1);
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

  onInfoImageSelected(sectionIndex: number, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.infoImageFiles[sectionIndex] = file;
      this.infoImageFileNames[sectionIndex] = file.name;
      this.previewImage(file, 'info', sectionIndex);
    }
  }

  onInfoImageDrop(sectionIndex: number, event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.infoImageFiles[sectionIndex] = file;
      this.infoImageFileNames[sectionIndex] = file.name;
      this.previewImage(file, 'info', sectionIndex);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // BOTTOM BANNER
  // ═══════════════════════════════════════════════════════════════════════

  addBottomBanner(): void {
    this.data.bottomBanner = {
      titulo: '',
      texto: '',
      imagen: ''
    };
  }

  removeBottomBanner(): void {
    delete this.data.bottomBanner;
    this.bannerImageFile = null;
    this.bannerImageFileName = '';
    this.bannerImagePreview = null;
  }

  onBannerImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.bannerImageFile = file;
      this.bannerImageFileName = file.name;
      this.previewImage(file, 'banner');
    }
  }

  onBannerImageDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.bannerImageFile = file;
      this.bannerImageFileName = file.name;
      this.previewImage(file, 'banner');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PREVIEW DE IMÁGENES
  // ═══════════════════════════════════════════════════════════════════════

  private previewImage(file: File, type: 'hero' | 'content' | 'info' | 'banner', index?: number): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const preview = e.target.result;
      switch (type) {
        case 'hero':
          this.heroImagePreview = preview;
          break;
        case 'content':
          if (index !== undefined) {
            this.contentImagePreviews[index] = preview;
          }
          break;
        case 'info':
          if (index !== undefined) {
            this.infoImagePreviews[index] = preview;
          }
          break;
        case 'banner':
          this.bannerImagePreview = preview;
          break;
      }
    };
    reader.readAsDataURL(file);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // GUARDAR
  // ═══════════════════════════════════════════════════════════════════════

  async save(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;

    try {
      // Subir imagen hero si existe archivo pendiente
      if (this.heroImageFile) {
        const heroUrl = await this.masInfoService.uploadImage(this.heroImageFile, 'mas-info-hero');
        this.data.hero.imagenFondo = heroUrl;
        this.heroImageFile = null;
      }

      // Subir imágenes de content sections
      for (let i = 0; i < this.data.contentSections.length; i++) {
        if (this.contentImageFiles[i]) {
          const url = await this.masInfoService.uploadImage(
            this.contentImageFiles[i]!,
            `mas-info-content-${i}`
          );
          this.data.contentSections[i].imagen = url;
          this.contentImageFiles[i] = null;
        }
      }

      // Subir imágenes de info sections
      for (let i = 0; i < this.data.sections.length; i++) {
        if (this.infoImageFiles[i]) {
          const url = await this.masInfoService.uploadImage(
            this.infoImageFiles[i]!,
            `mas-info-info-${i}`
          );
          this.data.sections[i].imagen = url;
          this.infoImageFiles[i] = null;
        }
      }

      // Subir imagen de bottom banner
      if (this.bannerImageFile && this.data.bottomBanner) {
        const bannerUrl = await this.masInfoService.uploadImage(
          this.bannerImageFile,
          'mas-info-banner'
        );
        this.data.bottomBanner.imagen = bannerUrl;
        this.bannerImageFile = null;
      }

      // Guardar en base de datos
      this.masInfoService.updateData(this.data);
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

  // ═══════════════════════════════════════════════════════════════════════
  // RESET
  // ═══════════════════════════════════════════════════════════════════════

  resetForm(): void {
    this.data = JSON.parse(JSON.stringify(this.originalData));
    this.heroImageFile = null;
    this.contentImageFiles = this.data.contentSections.map(() => null);
    this.infoImageFiles = this.data.sections.map(() => null);
    this.bannerImageFile = null;
    
    this.heroImageFileName = '';
    this.contentImageFileNames = this.data.contentSections.map(() => '');
    this.infoImageFileNames = this.data.sections.map(() => '');
    this.bannerImageFileName = '';

    this.heroImagePreview = this.data.hero.imagenFondo || null;
    this.contentImagePreviews = this.data.contentSections.map(s => s.imagen || null);
    this.infoImagePreviews = this.data.sections.map(s => s.imagen || null);
    this.bannerImagePreview = this.data.bottomBanner?.imagen || null;

    this.errorMessage = null;
  }
}