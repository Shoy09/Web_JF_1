import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { GeneralProductService } from '../../services/general-product.service';
import { ProductItem } from '../../models/general-product';

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

  isLoading = true;
  errorMessage: string | null = null;

  languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'pt', label: 'Português' }
  ];

  headerData: HeaderData = { breadcrumbs: [], titulo: '', descripcion: '' };
  products: ProductItem[] = [];
  infoSection = {
    texto: '',
    boton: { label: '', link: '' }
  };

  constructor(
    private translate: TranslateService,
    private generalService: GeneralProductService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    const savedLang = localStorage.getItem('language') || 'en';
    this.currentLanguage = savedLang;
    this.translate.use(savedLang);

    const slug = this.route.snapshot.paramMap.get('slug');
    const categoryKey = `/productos/${slug}`;

    await this.loadData(categoryKey);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private async loadData(categoryKey: string): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;
    try {
      const data = await this.generalService.fetchDataForKey(categoryKey);
      this.applyData(data);
    } catch (err) {
      this.errorMessage = 'Error al cargar los productos. Intenta de nuevo.';
      console.error('Error cargando categoría:', err);
    } finally {
      this.isLoading = false;
    }
  }

  private applyData(data: any): void {
    if (!data) return;
    this.headerData = {
      breadcrumbs: data.headerData?.breadcrumbs || [],
      titulo:      data.headerData?.titulo      || '',
      descripcion: data.headerData?.descripcion || ''
    };
    this.products = Array.isArray(data.products) ? data.products : [];
    this.infoSection = {
      texto: data.infoSection?.texto || '',
      boton: {
        label: data.infoSection?.boton?.label || '',
        link:  data.infoSection?.boton?.link  || '#'
      }
    };
  }

  selectLanguage(langCode: string): void {
    this.currentLanguage = langCode;
    localStorage.setItem('language', langCode);
    this.translate.use(langCode);
  }

  get currentLanguageLabel(): string {
    return this.languages.find(l => l.code === this.currentLanguage)?.label || '';
  }
}