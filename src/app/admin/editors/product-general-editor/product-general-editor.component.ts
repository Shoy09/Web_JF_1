// product-general-editor.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { GeneralProductService } from '../../../services/general-product.service';
import { NavbarService } from '../../../services/navbar.service';
import { ProductService } from '../../../services/product.service';
import { GeneralProductData } from '../../../models/general-product';
import { NavbarData } from '../../../models/navbar.model';

@Component({
  selector: 'app-product-general-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatExpansionModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
  templateUrl: './product-general-editor.component.html',
  styleUrls: ['./product-general-editor.component.css']
})
export class ProductGeneralEditorComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  showSuccessMessage = false;
  isLoading = false;
  errorMessage: string | null = null;

  categories: { titulo: string; ruta: string }[] = [];
  selectedCategoryKey: string | null = null;

  private originalCategoryKey: string | null = null;
  showDeleteConfirm = false;
  isNewCategory = false;

  private productImageFiles: (File | null)[] = [];
  private productImageFileNames: string[] = [];
  private subs = new Subscription();

  constructor(
    private fb: FormBuilder,
    private generalProductService: GeneralProductService,
    private navbarService: NavbarService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    this.buildEmptyForm();

    this.subs.add(
      this.navbarService.navbarData$.subscribe((navbar: NavbarData) => {
        this.categories = (navbar?.productosMenu ?? [])
          .filter(cat => !!cat.ruta)
          .map(cat => ({ titulo: cat.titulo, ruta: cat.ruta as string }));
      })
    );

    const lastKey = this.generalProductService.getSelectedKey();
    if (lastKey) {
      this.selectedCategoryKey = lastKey;
      this.originalCategoryKey = lastKey;
      this.loadFormForKey(lastKey);
    }
  }

  ngOnDestroy() { this.subs.unsubscribe(); }

  toSlug(text: string): string {
    return text.trim().toLowerCase().replace(/\s+/g, '-');
  }

  private buildBreadcrumbsFromRuta(ruta: string): string[] {
    const parts = ruta.split('/').filter(p => p.length > 0);
    return ['INICIO', ...parts.map(p => p.replace(/-/g, ' ').toUpperCase())];
  }

  onCategoryTituloChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const slug = this.toSlug(value);
    const newRuta = `/productos/${slug}`;
    this.form.get('categoryMeta.ruta')?.setValue(newRuta, { emitEvent: false });
    this.updateAutoBreadcrumbs(newRuta);
  }

  private updateAutoBreadcrumbs(ruta: string) {
    const crumbs = this.buildBreadcrumbsFromRuta(ruta);
    const breadcrumbsArray = this.form.get('headerData.breadcrumbs') as FormArray;
    breadcrumbsArray.clear();
    crumbs.forEach(c => breadcrumbsArray.push(this.fb.control(c)));
  }

  onProductTitleChange(index: number, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const catSlug = this.toSlug(this.form.get('categoryMeta.titulo')?.value ?? '');
    const productSlug = this.toSlug(value);
    this.productsArray.at(index).get('link')?.setValue(
      `/productos/${catSlug}/${productSlug}`,
      { emitEvent: false }
    );
  }

  async onCategoryChange(ruta: string) {
    this.selectedCategoryKey = ruta;
    this.originalCategoryKey = ruta;
    this.isNewCategory = false;
    this.generalProductService.selectCategory(ruta);
    await this.loadFormForKey(ruta);
  }

  createNewCategory() {
    this.selectedCategoryKey = null;
    this.originalCategoryKey = null;
    this.isNewCategory = true;
    this.generalProductService.selectCategory('');
    this.buildEmptyForm(true);
  }

  confirmDelete() { this.showDeleteConfirm = true; }
  cancelDelete() { this.showDeleteConfirm = false; }

  // ✅ Ahora borra en DB: categoría + todos sus productos
  async deleteCategory() {
    if (!this.originalCategoryKey) return;

    this.isLoading = true;
    this.errorMessage = null;

    try {
      // 1. Obtener los productos de la categoría para borrarlos también
      const categoryData = this.generalProductService.getDataForKey(this.originalCategoryKey);
      const productRutas = (categoryData?.products ?? [])
        .map((p: any) => p.link)
        .filter((r: string) => !!r && r !== '/productos/');

      // 2. Borrar cada producto de la tabla products
      for (const ruta of productRutas) {
        try {
          await this.productService.deleteProductByRuta(ruta);
        } catch (err: any) {
          if (err?.status !== 404) {
            console.warn(`No se pudo borrar producto ${ruta}:`, err);
          }
        }
      }

      // 3. Borrar la categoría de general_product_page
      try {
        await this.generalProductService.deleteDataForKey(this.originalCategoryKey);
      } catch (err: any) {
        if (err?.status !== 404) {
          console.warn('No se pudo borrar la categoría del backend:', err);
        }
      }

      // 4. Quitar del navbar
      const current = JSON.parse(JSON.stringify(this.navbarService.getNavbar()));
      current.productosMenu = current.productosMenu.filter(
        (c: any) => c.ruta !== this.originalCategoryKey
      );
      this.navbarService.updateNavbar(current);

    } catch (err) {
      this.errorMessage = 'Error al eliminar la categoría. Intenta de nuevo.';
      console.error(err);
    } finally {
      this.isLoading = false;
    }

    // 5. Limpiar estado local
    this.selectedCategoryKey = null;
    this.originalCategoryKey = null;
    this.isNewCategory = false;
    this.showDeleteConfirm = false;
    this.generalProductService.selectCategory('');
    this.buildEmptyForm();
  }

  private async loadFormForKey(ruta: string) {
    if (!ruta || ruta === '/productos/' || ruta === '/productos') {
      this.buildEmptyForm();
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    try {
      const data = await this.generalProductService.fetchDataForKey(ruta);
      this.productImageFiles = (data.products ?? []).map(() => null);
      this.productImageFileNames = (data.products ?? []).map(() => '');

      const navbar = this.navbarService.getNavbar();
      const navbarCat = (navbar.productosMenu ?? []).find(c => c.ruta === ruta);

      this.buildForm(data, navbarCat);
    } catch (err) {
      this.errorMessage = 'Error al cargar los datos de la categoría. Intenta de nuevo.';
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  private buildEmptyForm(isNew = false) {
    this.form = this.fb.group({
      categoryMeta: this.fb.group({
        titulo: [''],
        ruta: ['/productos/'],
      }),
      headerData: this.fb.group({
        titulo: [''],
        descripcion: [''],
        breadcrumbs: this.fb.array([])
      }),
      infoSection: this.fb.group({
        texto: [''],
        boton: this.fb.group({ label: [''], link: [''] })
      }),
      products: this.fb.array([])
    });
  }

  private buildForm(data: GeneralProductData, navbarCat?: any) {
    const ruta = navbarCat?.ruta ?? '';
    const autoCrumbs = ruta
      ? this.buildBreadcrumbsFromRuta(ruta)
      : (data.headerData?.breadcrumbs ?? []);

    const breadcrumbs = this.fb.array(
      autoCrumbs.map((b: string) => this.fb.control(b))
    );

    const catSlug = navbarCat?.ruta ? navbarCat.ruta.split('/').pop() ?? '' : '';

    const navbarItemRutas = new Set<string>(
      (navbarCat?.items ?? []).map((item: any) => item.ruta)
    );

    const products = this.fb.array(
      (data.products ?? []).map((p: any) => {
        const existingLink = p.link ?? '';
        const autoLink = existingLink || `/productos/${catSlug}/${this.toSlug(p.title ?? '')}`;
        const showInNavbar = p.showInNavbar ?? navbarItemRutas.has(autoLink);
        return this.fb.group({
          title: [p.title ?? ''],
          image: [p.image ?? ''],
          link: [autoLink],
          showInNavbar: [showInNavbar]
        });
      })
    );

    this.form = this.fb.group({
      categoryMeta: this.fb.group({
        titulo: [navbarCat?.titulo ?? ''],
        ruta: [navbarCat?.ruta ?? '/productos/'],
      }),
      headerData: this.fb.group({
        titulo: [data.headerData?.titulo ?? ''],
        descripcion: [data.headerData?.descripcion ?? ''],
        breadcrumbs
      }),
      infoSection: this.fb.group({
        texto: [data.infoSection?.texto ?? ''],
        boton: this.fb.group({
          label: [data.infoSection?.boton?.label ?? ''],
          link: [data.infoSection?.boton?.link ?? '']
        })
      }),
      products
    });
  }

  get breadcrumbsArray(): FormArray { return this.form.get('headerData.breadcrumbs') as FormArray; }
  get productsArray(): FormArray { return this.form.get('products') as FormArray; }

  getProductTitle(i: number): string {
    return this.productsArray.at(i)?.get('title')?.value ?? '';
  }

  addProduct() {
    this.productsArray.push(this.fb.group({
      title: [''],
      image: [''],
      link: [''],
      showInNavbar: [false]
    }));
    this.productImageFiles.push(null);
    this.productImageFileNames.push('');
  }

  async removeProduct(i: number) {
    const ruta = this.productsArray.at(i).get('link')?.value as string;

    this.productsArray.removeAt(i);
    this.productImageFiles.splice(i, 1);
    this.productImageFileNames.splice(i, 1);

    if (ruta && ruta !== '/productos/') {
      try {
        await this.productService.deleteProductByRuta(ruta);
      } catch (err: any) {
        if (err?.status !== 404) {
          console.error('Error al eliminar producto del backend:', err);
        }
      }
    }
  }

  onProductImageSelected(i: number, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.productImageFiles[i] = file;
    this.productImageFileNames[i] = file.name;
    const reader = new FileReader();
    reader.onload = (e: any) => this.productsArray.at(i).get('image')?.setValue(e.target.result);
    reader.readAsDataURL(file);
  }

  onDragOver(event: DragEvent) { event.preventDefault(); }

  onDropProductImage(i: number, event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    this.productImageFiles[i] = file;
    this.productImageFileNames[i] = file.name;
    const reader = new FileReader();
    reader.onload = (e: any) => this.productsArray.at(i).get('image')?.setValue(e.target.result);
    reader.readAsDataURL(file);
  }

  productImageFileName(i: number): string { return this.productImageFileNames[i] ?? ''; }

  // ─── Guardar ──────────────────────────────────────────────────────────────

  async saveChanges() {
    this.errorMessage = null;
    const v = this.form.getRawValue();
    const categoryRuta: string = v.categoryMeta.ruta;
    const categoryTitulo: string = (v.categoryMeta.titulo ?? '').trim().toLowerCase();

    if (!v.categoryMeta.titulo?.trim()) {
      this.errorMessage = 'El título de la categoría es obligatorio.';
      return;
    }
    if (!categoryRuta || categoryRuta === '/productos/' || categoryRuta === '/productos') {
      this.errorMessage = 'Escribe un título para generar la ruta de la categoría.';
      return;
    }

    const otherCategories = this.categories.filter(cat => cat.ruta !== this.originalCategoryKey);
    const duplicate = otherCategories.find(
      cat => cat.ruta === categoryRuta || cat.titulo.trim().toLowerCase() === categoryTitulo
    );
    if (duplicate) {
      this.errorMessage = `Ya existe una categoría con ese nombre o ruta: "${duplicate.titulo}" (${duplicate.ruta})`;
      return;
    }

    this.isLoading = true;
    try {
      // 1. Guardar la página general de categoría
      await this.generalProductService.updateDataForKey(categoryRuta, {
        headerData: v.headerData,
        infoSection: v.infoSection,
        products: v.products
      } as GeneralProductData);

      // 2. Crear en Products los que no existen aún
      for (const p of v.products) {
        if (!p.link || p.link === '/productos/') continue;

        let exists = false;
        try {
          await this.productService.fetchProductForKey(p.link);
          exists = true;
        } catch {
          exists = false;
        }

        if (!exists) {
          try {
            await this.productService.updateProductForKey(
              p.link,
              {
                ruta:         p.link,
                breadcrumbs:  this.buildBreadcrumbsFromRuta(p.link).map(label => ({ label })),
                title:        p.title || '',
                subtitle:     '',
                descriptions: [],
                mainImage:    p.image || '',
                thumbnails:   [],
                contactLink:  '',
                features:     [],
                downloads:    []
              },
              [], null, []
            );
          } catch (createErr) {
            console.warn(`No se pudo crear el producto ${p.link}:`, createErr);
          }
        }
      }

      // 3. Sincronizar navbar
      const navbarItems = v.products
        .filter((p: any) => p.showInNavbar)
        .map((p: any) => ({ nombre: p.title, ruta: p.link }));

      this.syncWithNavbar(v.categoryMeta.titulo, categoryRuta, navbarItems, this.originalCategoryKey);

      this.selectedCategoryKey = categoryRuta;
      this.originalCategoryKey = categoryRuta;
      this.isNewCategory = false;
      this.generalProductService.selectCategory(categoryRuta);

      this.showSuccessMessage = true;
      setTimeout(() => this.showSuccessMessage = false, 3000);
    } catch (err) {
      this.errorMessage = 'Error al guardar los cambios. Intenta de nuevo.';
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  private syncWithNavbar(
    titulo: string,
    ruta: string,
    items: { nombre: string; ruta: string }[],
    originalKey: string | null
  ) {
    const current: NavbarData = JSON.parse(JSON.stringify(this.navbarService.getNavbar()));
    const lookupKey = originalKey ?? ruta;
    const menuIndex = current.productosMenu.findIndex(c => c.ruta === lookupKey);
    const updatedCategory = { titulo, ruta, items };

    if (menuIndex >= 0) {
      current.productosMenu[menuIndex] = updatedCategory;
    } else {
      current.productosMenu.push(updatedCategory);
    }

    this.navbarService.updateNavbar(current);
  }

  async resetForm() {
    if (this.selectedCategoryKey) {
      await this.loadFormForKey(this.selectedCategoryKey);
    } else {
      this.buildEmptyForm(true);
    }
  }

  trackByIndex(i: number) { return i; }

  goToProductEditor(productRuta: string) {
    const catRuta = this.form.get('categoryMeta.ruta')?.value ?? '';
    this.router.navigate(['/admin/products'], {
      queryParams: { cat: catRuta, prod: productRuta }
    });
  }
}