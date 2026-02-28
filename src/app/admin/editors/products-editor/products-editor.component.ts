import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ProductService } from '../../../services/product.service';
import { HeroProduct, Feature, Download } from '../../../models/product.model';

@Component({
  selector: 'app-products-editor',
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
    MatTooltipModule
  ],
  templateUrl: './products-editor.component.html',
  styleUrls: ['./products-editor.component.css']
})
export class ProductsEditorComponent implements OnInit {
  product!: HeroProduct;
  originalProduct!: HeroProduct;
  showSuccessMessage = false;

  // Archivos
  downloadsFiles: (File | null)[] = [];
  mainImageFile: File | null = null;
  thumbnailFiles: (File | null)[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.product = this.productService.getProduct();
    this.originalProduct = JSON.parse(JSON.stringify(this.product));

    if (!this.product.downloads) this.product.downloads = [];
    if (!this.product.features) this.product.features = [];
    if (!this.product.descriptions) this.product.descriptions = [];
    if (!this.product.thumbnails) this.product.thumbnails = [];

    this.downloadsFiles = Array(this.product.downloads.length).fill(null);
    this.thumbnailFiles = Array(this.product.thumbnails.length).fill(null);
    this.mainImageFile = null;
  }

  trackByIndex(index: number): number {
    return index;
  }

  // ================= GUARDAR =================
  save(): void {
    const hasFiles =
      this.mainImageFile !== null ||
      this.thumbnailFiles.some(f => f !== null) ||
      this.downloadsFiles.some(f => f !== null);

    if (hasFiles) {
      this.productService.updateProductWithFiles(
        this.product,
        this.downloadsFiles,
        this.mainImageFile,
        this.thumbnailFiles
      );
    } else {
      this.productService.updateProduct(this.product);
    }

    this.showSuccessMessage = true;
    setTimeout(() => (this.showSuccessMessage = false), 3000);
    this.originalProduct = JSON.parse(JSON.stringify(this.product));
  }

  // ================= RESET =================
  resetForm(): void {
    this.product = JSON.parse(JSON.stringify(this.originalProduct));
    this.downloadsFiles = Array(this.product.downloads?.length ?? 0).fill(null);
    this.thumbnailFiles = Array(this.product.thumbnails?.length ?? 0).fill(null);
    this.mainImageFile = null;
  }

  // ================= IMAGEN PRINCIPAL =================
  onMainImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.mainImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.product.mainImage = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onDropMainImage(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    this.mainImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.product.mainImage = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  mainImageFileName(): string {
    return this.mainImageFile?.name ?? '';
  }

  // ================= THUMBNAILS =================
  addThumbnail(): void {
    this.product.thumbnails.push('');
    this.thumbnailFiles.push(null);
  }

  removeThumbnail(index: number): void {
    this.product.thumbnails.splice(index, 1);
    this.thumbnailFiles.splice(index, 1);
  }

  onThumbnailSelected(index: number, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.thumbnailFiles[index] = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.product.thumbnails[index] = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onDropThumbnail(index: number, event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    this.thumbnailFiles[index] = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.product.thumbnails[index] = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  thumbnailFileName(index: number): string {
    return this.thumbnailFiles[index]?.name ?? '';
  }

  // ================= DESCRIPCIONES =================
  addDescription(): void { this.product.descriptions.push(''); }
  removeDescription(index: number): void { this.product.descriptions.splice(index, 1); }

  // ================= FEATURES =================
  addFeature(): void {
    this.product.features = this.product.features || [];
    this.product.features.push({ title: '', description: '' });
  }
  removeFeature(index: number): void { this.product.features?.splice(index, 1); }

  // ================= DOWNLOADS =================
  addDownload(): void {
    this.product.downloads = this.product.downloads || [];
    this.product.downloads.push({ title: '', description: '', link: '' });
    this.downloadsFiles.push(null);
  }

  removeDownload(index: number): void {
    this.product.downloads?.splice(index, 1);
    this.downloadsFiles.splice(index, 1);
  }

  onFileSelected(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.downloadsFiles[index] = input.files?.[0] ?? null;
  }

  onDropFile(index: number, event: DragEvent): void {
    event.preventDefault();
    this.downloadsFiles[index] = event.dataTransfer?.files[0] ?? null;
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); }

  fileName(index: number): string {
    return this.downloadsFiles[index]?.name ?? '';
  }
}