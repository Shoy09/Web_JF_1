// products-editor.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import { NavbarService } from '../../../services/navbar.service';
import { GeneralProductService } from '../../../services/general-product.service';
import { HeroProduct } from '../../../models/product.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink, ActivatedRoute } from '@angular/router';

interface NavbarCategory {
  titulo: string;
  ruta: string;
}

@Component({
  selector: 'app-product-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  templateUrl: './products-editor.component.html',
  styleUrls: ['./products-editor.component.css']
})
export class ProductsEditorComponent implements OnInit, OnDestroy {

  navbarCategories: NavbarCategory[] = [];
  selectedCategoryKey: string | null = null;
  selectedProductKey: string | null = null;
  productsInCategory: { nombre: string; ruta: string }[] = [];

  isLoading = false;
  isLoadingProducts = false;
  errorMessage: string | null = null;
  showSuccessMessage = false;

  product!: HeroProduct;

  private _mainImageFile: File | null = null;
  private _mainImageFileName = '';
  private _thumbnailFiles: (File | null)[] = [];
  private _thumbnailFileNames: string[] = [];
  private _downloadFiles: (File | null)[] = [];
  private _downloadFileNames: string[] = [];

  private subs = new Subscription();
  private _queryParamsApplied = false;

  constructor(
    private productService: ProductService,
    private navbarService: NavbarService,
    private generalProductService: GeneralProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const qCat = this.route.snapshot.queryParamMap.get('cat');
    const qProd = this.route.snapshot.queryParamMap.get('prod');

    this.subs.add(
      this.navbarService.navbarData$.subscribe(async navbar => {
        this.navbarCategories = (navbar?.productosMenu ?? [])
          .filter((cat: any) => !!cat.ruta)
          .map((cat: any) => ({ titulo: cat.titulo, ruta: cat.ruta as string }));

        if (qCat && this.navbarCategories.length > 0 && !this._queryParamsApplied) {
          this._queryParamsApplied = true;
          this.selectedCategoryKey = qCat;
          this.productService.selectCategory(qCat);
          await this.loadProductsForCategory(qCat);

          if (qProd) {
            // Forzar que aparezca en el dropdown aunque no esté en el grid
            if (!this.productsInCategory.find(p => p.ruta === qProd)) {
              this.productsInCategory = [
                ...this.productsInCategory,
                { nombre: qProd.split('/').pop() ?? qProd, ruta: qProd }
              ];
            }
            this.selectedProductKey = qProd;
            this.productService.selectProduct(qProd);
            await this.loadProduct(qProd);
          }
        }
      })
    );

    // Sin query params → restaurar selección previa
    if (!qCat) {
      const catKey = this.productService.getSelectedCategoryKey();
      const prodKey = this.productService.getSelectedKey();
      if (catKey) {
        this.selectedCategoryKey = catKey;
        this.loadProductsForCategory(catKey).then(async () => {
          if (prodKey) {
            this.selectedProductKey = prodKey;
            this.productService.selectProduct(prodKey);
            await this.loadProduct(prodKey);
          }
        });
      }
    }
  }

  ngOnDestroy() { this.subs.unsubscribe(); }

  async onCategoryChange(ruta: string) {
    this.selectedCategoryKey = ruta;
    this.selectedProductKey = null;
    this.productsInCategory = [];
    this.productService.selectCategory(ruta);
    await this.loadProductsForCategory(ruta);
  }

  private async loadProductsForCategory(categoryRuta: string) {
    if (!categoryRuta || categoryRuta === '/productos/' || categoryRuta === '/productos') {
      this.productsInCategory = [];
      return;
    }
    this.isLoadingProducts = true;
    try {
      const data = await this.generalProductService.fetchDataForKey(categoryRuta);
      const gridProducts: { nombre: string; ruta: string }[] = (data.products ?? [])
        .filter((p: any) => !!p.title && !!p.link)
        .map((p: any) => ({ nombre: p.title, ruta: p.link }));

      const navbar = this.navbarService.getNavbar();
      const navbarCat = (navbar.productosMenu ?? []).find(c => c.ruta === categoryRuta);
      const navbarItems: { nombre: string; ruta: string }[] = (navbarCat?.items ?? [])
        .filter((i: any) => !!i.nombre && !!i.ruta)
        .map((i: any) => ({ nombre: i.nombre, ruta: i.ruta as string }));

      const rutasGrid = new Set(gridProducts.map(p => p.ruta));
      const extraFromNavbar = navbarItems.filter(i => !rutasGrid.has(i.ruta));
      this.productsInCategory = [...gridProducts, ...extraFromNavbar];

      const map: Record<string, { nombre: string; ruta: string }[]> = {};
      map[categoryRuta] = this.productsInCategory;
      this.productService.setCategoryProductsMap(map);
    } catch (err) {
      console.error('Error cargando productos de la categoría:', err);
      this.productsInCategory = [];
    } finally {
      this.isLoadingProducts = false;
    }
  }

  async onProductChange(ruta: string) {
    this.selectedProductKey = ruta;
    this.productService.selectProduct(ruta);
    await this.loadProduct(ruta);
  }

  private async loadProduct(ruta: string) {
    this.isLoading = true;
    this.errorMessage = null;
    try {
      const product = await this.productService.fetchProductForKey(ruta);
      this.product = product;
      this._mainImageFile = null;
      this._mainImageFileName = '';
      this._thumbnailFiles = (product.thumbnails ?? []).map(() => null);
      this._thumbnailFileNames = (product.thumbnails ?? []).map(() => '');
      this._downloadFiles = (product.downloads ?? []).map(() => null);
      this._downloadFileNames = (product.downloads ?? []).map(() => '');
    } catch (err) {
      // Si no existe en BD, inicializar vacío para poder editarlo
      this.product = {
        ruta:         ruta,
        breadcrumbs:  [],
        title:        '',
        subtitle:     '',
        descriptions: [],
        mainImage:    '',
        thumbnails:   [],
        contactLink:  '',
        features:     [],
        downloads:    []
      };
      this.errorMessage = null;
      console.warn('Producto no encontrado, iniciando vacío:', ruta);
    } finally {
      this.isLoading = false;
    }
  }

  async save() {
    if (!this.selectedProductKey) return;
    this.isLoading = true;
    this.errorMessage = null;
    try {
      await this.productService.updateProductForKey(
        this.selectedProductKey,
        this.product,
        this._downloadFiles,
        this._mainImageFile,
        this._thumbnailFiles
      );
      this.showSuccessMessage = true;
      setTimeout(() => this.showSuccessMessage = false, 3000);
    } catch (err) {
      this.errorMessage = 'Error al guardar el producto. Intenta de nuevo.';
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  async resetForm() {
    if (this.selectedProductKey) await this.loadProduct(this.selectedProductKey);
  }

  onMainImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this._mainImageFile = file;
    this._mainImageFileName = file.name;
    const reader = new FileReader();
    reader.onload = e => this.product.mainImage = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  onDropMainImage(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    this._mainImageFile = file;
    this._mainImageFileName = file.name;
    const reader = new FileReader();
    reader.onload = e => this.product.mainImage = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  mainImageFileName(): string { return this._mainImageFileName; }

  addThumbnail() {
    this.product.thumbnails.push('');
    this._thumbnailFiles.push(null);
    this._thumbnailFileNames.push('');
  }

  removeThumbnail(i: number) {
    this.product.thumbnails.splice(i, 1);
    this._thumbnailFiles.splice(i, 1);
    this._thumbnailFileNames.splice(i, 1);
  }

  onThumbnailSelected(i: number, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this._thumbnailFiles[i] = file;
    this._thumbnailFileNames[i] = file.name;
    const reader = new FileReader();
    reader.onload = e => this.product.thumbnails[i] = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  onDropThumbnail(i: number, event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    this._thumbnailFiles[i] = file;
    this._thumbnailFileNames[i] = file.name;
    const reader = new FileReader();
    reader.onload = e => this.product.thumbnails[i] = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  thumbnailFileName(i: number): string { return this._thumbnailFileNames[i] ?? ''; }

  addDescription() { this.product.descriptions.push(''); }
  removeDescription(i: number) { this.product.descriptions.splice(i, 1); }

  addFeature() {
    if (!this.product.features) this.product.features = [];
    this.product.features.push({ title: '', description: '' });
  }

  removeFeature(i: number) { this.product.features?.splice(i, 1); }

  addDownload() {
    if (!this.product.downloads) this.product.downloads = [];
    this.product.downloads.push({ title: '', description: '', link: '' });
    this._downloadFiles.push(null);
    this._downloadFileNames.push('');
  }

  removeDownload(i: number) {
    this.product.downloads?.splice(i, 1);
    this._downloadFiles.splice(i, 1);
    this._downloadFileNames.splice(i, 1);
  }

  onFileSelected(i: number, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this._downloadFiles[i] = file;
    this._downloadFileNames[i] = file.name;
  }

  onDropFile(i: number, event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    this._downloadFiles[i] = file;
    this._downloadFileNames[i] = file.name;
  }

  fileName(i: number): string { return this._downloadFileNames[i] ?? ''; }

  onDragOver(event: DragEvent) { event.preventDefault(); }
  trackByIndex(i: number) { return i; }
}