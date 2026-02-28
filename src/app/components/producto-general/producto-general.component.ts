import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { GeneralProductService } from '../../services/general-product.service';

interface Product {
  title: string;
  image: string;
  link: string;
}

interface HeaderData {
  breadcrumbs: string[];
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-producto-general',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],     
  templateUrl: './producto-general.component.html',
  styleUrls: ['./producto-general.component.css']
})
export class ProductoGeneralComponent implements OnInit, OnDestroy {

  currentLanguage: string = 'en';
  private sub = new Subscription();

  // ===============================
  // IDIOMAS
  // ===============================
  languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'pt', label: 'Português' }
  ];

  // ===============================
  // HEADER DINÁMICO
  // ===============================
  headerData: HeaderData = { breadcrumbs: [], titulo: '', descripcion: '' };

  // ===============================
  // PRODUCTOS DINÁMICOS
  // ===============================
  products: Product[] = [];

  // ===============================
// SECCIÓN INFORMACIÓN DINÁMICA
// ===============================
infoSection = {
  texto: '',
  boton: { label: '', link: '' }
};

  constructor(private translate: TranslateService, private generalService: GeneralProductService) {}

  ngOnInit(): void {
    const savedLang = localStorage.getItem('language') || 'en';
    this.currentLanguage = savedLang;
    this.translate.use(savedLang);
    const data = this.generalService.getData();
    this.applyData(data);
    this.sub.add(
      this.generalService.data$.subscribe(d => this.applyData(d))
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private applyData(data: any) {
    if (!data) return;
    this.headerData = {
      breadcrumbs: data.headerData?.breadcrumbs || [],
      titulo: data.headerData?.titulo || '',
      descripcion: data.headerData?.descripcion || ''
    };
    this.products = Array.isArray(data.products) ? data.products : [];
    this.infoSection = {
      texto: data.infoSection?.texto || '',
      boton: {
        label: data.infoSection?.boton?.label || '',
        link: data.infoSection?.boton?.link || '#'
      }
    };
  }

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
