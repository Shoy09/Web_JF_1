import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeService } from '../../../services/home.service';
import { HomeData } from '../../../models/home.model';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-home-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule
  ],
  templateUrl: './home-editor.component.html',
  styleUrls: ['./home-editor.component.css']
})
export class HomeEditorComponent implements OnInit {
  homeData!: HomeData;
  showSuccessMessage = false;
  imageFiles: (File | null)[] = [];

  constructor(private homeService: HomeService) {}

async ngOnInit(): Promise<void> {
  this.resetForm(); // carga datos del localStorage primero
  await this.homeService.loadFromBackend();
  this.resetForm(); // actualiza con datos del backend
}

  trackByIndex(index: number, item: any): number {
    return index;
  }

  // ================= GUARDAR =================
  saveChanges() {
    if (this.imageFiles.some(f => f !== null)) {
      this.homeService.updateHomeWithFiles(this.homeData, this.imageFiles);
    } else {
      this.homeService.updateHome(this.homeData);
    }
    this.showSuccessMessage = true;
    setTimeout(() => this.showSuccessMessage = false, 3000);
  }

  // ================= RESET =================
  resetForm() {
    const data = this.homeService.getHome();
    if (data) {
      this.homeData = JSON.parse(JSON.stringify(data));
      this.imageFiles = Array(this.homeData.cards.length).fill(null);
    }
  }

  // ================= HERO =================
  addHeroLine() {
    this.homeData.hero.titleLines.push('');
  }

  removeHeroLine(index: number) {
    this.homeData.hero.titleLines.splice(index, 1);
  }

  // ================= CARDS =================
  addCard() {
    this.homeData.cards.push({ image: '', title: '', buttonText: '', type: 'history' });
    this.imageFiles.push(null);
  }

  removeCard(index: number) {
    this.homeData.cards.splice(index, 1);
    this.imageFiles.splice(index, 1);
  }

onImageSelected(index: number, event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target?.result as string;
    this.homeData.cards[index].image = base64; // preview y dato a enviar
  };
  reader.readAsDataURL(file);
}

onDropImage(index: number, event: DragEvent): void {
  event.preventDefault();
  const file = event.dataTransfer?.files[0];
  if (file) {
    this.imageFiles[index] = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.homeData.cards[index].image = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  imageFileName(index: number): string {
    return this.imageFiles[index]?.name ?? '';
  }

  // ================= ABOUT =================
  addAboutParagraph() {
    this.homeData.about.paragraphs.push('');
  }

  removeAboutParagraph(index: number) {
    this.homeData.about.paragraphs.splice(index, 1);
  }
}