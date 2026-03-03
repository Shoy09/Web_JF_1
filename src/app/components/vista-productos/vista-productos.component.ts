import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProductService } from '../../services/product.service';
import { HeroProduct, Feature, Download } from '../../models/product.model';
import { ContactComponent } from '../../routes/contact/contact.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vista-productos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    ContactComponent,
    ScrollingModule
  ],
  templateUrl: './vista-productos.component.html',
  styleUrls: ['./vista-productos.component.css']
})
export class VistaProductosComponent implements OnInit, OnDestroy {

  @ViewChild('modalBox') modalBox!: ElementRef;

  // ─── Estado UI ────────────────────────────────────────────────────────────
  isLoading = true;
  errorMessage: string | null = null;

  // ─── Idiomas ──────────────────────────────────────────────────────────────
  languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'pt', label: 'Português' }
  ];
  currentLanguage = 'en';
  currentYear = new Date().getFullYear();

  // ─── Producto ─────────────────────────────────────────────────────────────
  heroProduct!: HeroProduct;
  selectedImage = '';
  features: Feature[] = [];
  downloads: Download[] = [];

  // ─── Modal ────────────────────────────────────────────────────────────────
  modalAbierto = false;

  private paramsSub!: Subscription;

  constructor(
    private translate: TranslateService,
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const savedLang = localStorage.getItem('language') || 'en';
    this.currentLanguage = savedLang;
    this.translate.use(savedLang);

    // ✅ Suscripción reactiva: se ejecuta cada vez que cambian los params
    this.paramsSub = this.route.params.subscribe(async params => {
      const categoria = params['categoria'];
      const slug      = params['slug'];

      console.log('PARAMS:', { categoria, slug });

      if (!categoria || !slug) {
        console.warn('Params vacíos, abortando carga');
        return;
      }

      const ruta = `/productos/${categoria}/${slug}`;
      await this.loadProduct(ruta);
    });
  }

  ngOnDestroy(): void {
    this.paramsSub?.unsubscribe();
  }

  // ─── Carga de datos ───────────────────────────────────────────────────────
  private async loadProduct(ruta: string): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;
    this.heroProduct = undefined!;  // limpia el producto anterior mientras carga
    this.selectedImage = '';
    try {
      const product = await this.productService.fetchProductForKey(ruta);
      this.applyProduct(product);
    } catch (err: any) {
      if (err?.status === 404) {
        this.applyProduct({ ruta, title: '', subtitle: '', descriptions: [], mainImage: '', thumbnails: [], contactLink: '', breadcrumbs: [], features: [], downloads: [] });
      } else {
        this.errorMessage = 'Error al cargar el producto. Intenta de nuevo.';
        console.error('Error cargando producto:', err);
      }
    } finally {
      this.isLoading = false;
    }
  }

  private applyProduct(product: HeroProduct): void {
    this.heroProduct   = product;
    this.selectedImage = product.mainImage || '';
    this.features      = product.features  || [];
    this.downloads     = product.downloads || [];
  }

  // ─── Galería ──────────────────────────────────────────────────────────────
  changeImage(imgUrl: string): void {
    this.selectedImage = imgUrl;
  }

  // ─── Modal ────────────────────────────────────────────────────────────────
  abrirModal(): void {
    this.modalAbierto = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    document.body.style.overflow = '';
  }

  cerrarModalAlFondo(event: MouseEvent): void {
    if (this.modalBox && !this.modalBox.nativeElement.contains(event.target)) {
      this.cerrarModal();
    }
  }

  // ─── Idioma ───────────────────────────────────────────────────────────────
  selectLanguage(langCode: string): void {
    this.currentLanguage = langCode;
    localStorage.setItem('language', langCode);
    this.translate.use(langCode);
  }

  get currentLanguageLabel(): string {
    return this.languages.find(l => l.code === this.currentLanguage)?.label ?? '';
  }
}