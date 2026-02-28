import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProductService } from '../../services/product.service';
import { HeroProduct, Feature, Download } from '../../models/product.model';

@Component({
  selector: 'app-vista-productos',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './vista-productos.component.html',
  styleUrls: ['./vista-productos.component.css']
})
export class VistaProductosComponent implements OnInit {

  // ===============================
  // IDIOMAS
  // ===============================
  languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'pt', label: 'Português' }
  ];
  currentLanguage: string = 'en';

  // ===============================
  // AÑO ACTUAL
  // ===============================
  currentYear: number = new Date().getFullYear();

  // ===============================
  // PRODUCTO
  // ===============================
  heroProduct!: HeroProduct;

  // ===============================
  // IMAGEN SELECCIONADA
  // ===============================
  selectedImage: string = '';

  changeImage(imgUrl: string) {
    this.selectedImage = imgUrl;
  }

  // ===============================
  // FEATURES y DESCARGAS (pueden venir del admin)
  // ===============================
  features: Feature[] = [];
  downloads: Download[] = [];

  constructor(
    private translate: TranslateService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    // idioma
    const savedLang = localStorage.getItem('language') || 'en';
    this.currentLanguage = savedLang;
    this.translate.use(savedLang);

    // producto desde service
    this.heroProduct = this.productService.getProduct();

    // imagen principal
    this.selectedImage = this.heroProduct.mainImage;

    // features y downloads
    this.features = this.heroProduct.features || [];
    this.downloads = this.heroProduct.downloads || [];
  }

  // ===============================
  // IDIOMA
  // ===============================
  selectLanguage(langCode: string) {
    this.currentLanguage = langCode;
    localStorage.setItem('language', langCode);
    this.translate.use(langCode);
  }

  get currentLanguageLabel(): string {
    const lang = this.languages.find(l => l.code === this.currentLanguage);
    return lang ? lang.label : '';
  }
}