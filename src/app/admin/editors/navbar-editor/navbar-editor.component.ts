// navbar-editor.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NavbarService } from '../../../services/navbar.service';
import { NavbarData } from '../../../models/navbar.model';

@Component({
  selector: 'app-navbar-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatExpansionModule,
    MatTooltipModule
  ],
  templateUrl: './navbar-editor.component.html',
  styleUrls: ['./navbar-editor.component.css']
})
export class NavbarEditorComponent implements OnInit {
  form!: FormGroup;
  originalData!: NavbarData;
  showSuccessMessage = false;

  constructor(
    private navbarService: NavbarService, 
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.resetForm();
  }

  trackByIndex(index: number): number {
    return index;
  }

  // Helpers para títulos en expansion panels
  getAboutItemTitle(index: number): string {
    const item = this.aboutMenuArray.at(index);
    return item?.get('nombre')?.value || '';
  }

  getSocialTitle(index: number): string {
    const item = this.redesArray.at(index);
    return item?.get('nombre')?.value || '';
  }

  getCategoryTitle(index: number): string {
    const category = this.productosMenuArray.at(index);
    return category?.get('titulo')?.value || '';
  }


  iconosSociales = [
  { class: 'bi bi-facebook',  nombre: 'Facebook' },
  { class: 'bi bi-instagram', nombre: 'Instagram' },
  { class: 'bi bi-twitter-x', nombre: 'X / Twitter' },
  { class: 'bi bi-linkedin',  nombre: 'LinkedIn' },
  { class: 'bi bi-youtube',   nombre: 'YouTube' },
  { class: 'bi bi-tiktok',    nombre: 'TikTok' },
  { class: 'bi bi-whatsapp',  nombre: 'WhatsApp' },
];

selectIcon(index: number, iconClass: string) {
  this.redesArray.at(index).get('icon')?.setValue(iconClass);
}

onLogoSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    this.form.get('logoActual')?.setValue(e.target?.result as string);
  };
  reader.readAsDataURL(file);
}

onLogoDrop(event: DragEvent): void {
  event.preventDefault();
  const file = event.dataTransfer?.files[0];
  if (!file) return;
  this.onLogoSelected({ target: { files: [file] } } as any);
}

onDragOver(event: DragEvent): void {
  event.preventDefault();
}

  // ================= GUARDAR =================
  saveChanges() {
    if (this.form.valid) {
      const v = this.form.value;
      const updated: NavbarData = {
        productosLabel: v.productosLabel,
        aboutLabel: v.aboutLabel,
        contactoLabel: v.contactoLabel,
        contactoRuta: v.contactoRuta,
        siguenos: v.siguenos,
        buscarPlaceholder: v.buscarPlaceholder,
        logoActual: v.logoActual,
        aboutMenu: v.aboutMenu.map((i: any) => ({ nombre: i.nombre, ruta: i.ruta })),
        redes: v.redes.map((r: any) => ({ nombre: r.nombre, icon: r.icon, url: r.url })),
        productosMenu: v.productosMenu.map((c: any) => ({
          titulo: c.titulo,
          ruta: c.ruta,
          items: c.items.map((it: any) => ({ nombre: it.nombre, ruta: it.ruta }))
        }))
      };
      
      this.navbarService.updateNavbar(updated);
      this.showSuccessMessage = true;
      setTimeout(() => this.showSuccessMessage = false, 3000);
      this.originalData = JSON.parse(JSON.stringify(updated));
    }
  }

  // ================= RESET =================
  resetForm() {
    const data = this.navbarService.getNavbar();
    this.originalData = JSON.parse(JSON.stringify(data));
    
    this.form = this.fb.group({
      productosLabel: [data.productosLabel],
      aboutLabel: [data.aboutLabel],
      contactoLabel: [data.contactoLabel],
      contactoRuta: [data.contactoRuta],
      siguenos: [data.siguenos],
      buscarPlaceholder: [data.buscarPlaceholder],
      logoActual: [data.logoActual],
      aboutMenu: this.fb.array(
        data.aboutMenu.map(i => this.fb.group({ nombre: [i.nombre], ruta: [i.ruta || ''] }))
      ),
      redes: this.fb.array(
        data.redes.map(r => this.fb.group({ nombre: [r.nombre], icon: [r.icon], url: [r.url] }))
      ),
      productosMenu: this.fb.array(
        data.productosMenu.map(c => this.fb.group({
          titulo: [c.titulo],
          ruta: [c.ruta || ''],
          items: this.fb.array(
            c.items.map(it => this.fb.group({ nombre: [it.nombre], ruta: [it.ruta || ''] }))
          )
        }))
      )
    });
  }

  // ================= GETTERS =================
  get aboutMenuArray(): FormArray {
    return this.form.get('aboutMenu') as FormArray;
  }

  get redesArray(): FormArray {
    return this.form.get('redes') as FormArray;
  }

  get productosMenuArray(): FormArray {
    return this.form.get('productosMenu') as FormArray;
  }

  // ================= ABOUT MENU =================
  addAboutItem() {
    this.aboutMenuArray.push(this.fb.group({ nombre: [''], ruta: [''] }));
  }

  removeAboutItem(index: number) {
    this.aboutMenuArray.removeAt(index);
  }

  // ================= REDES SOCIALES =================
  addSocialItem() {
    this.redesArray.push(this.fb.group({ nombre: [''], icon: [''], url: [''] }));
  }

  removeSocialItem(index: number) {
    this.redesArray.removeAt(index);
  }

  // ================= PRODUCTOS MENU =================
  addProductCategory() {
    this.productosMenuArray.push(
      this.fb.group({
        titulo: [''],
        ruta: [''],
        items: this.fb.array([])
      })
    );
  }

  removeProductCategory(index: number) {
    this.productosMenuArray.removeAt(index);
  }

  getItemsArray(categoryIndex: number): FormArray {
    return this.productosMenuArray.at(categoryIndex).get('items') as FormArray;
  }

  addProductItem(categoryIndex: number) {
    this.getItemsArray(categoryIndex).push(this.fb.group({ nombre: [''], ruta: [''] }));
  }

  removeProductItem(categoryIndex: number, itemIndex: number) {
    this.getItemsArray(categoryIndex).removeAt(itemIndex);
  }
}