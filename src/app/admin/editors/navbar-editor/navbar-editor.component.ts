// navbar-editor.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs';

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
export class NavbarEditorComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  originalData!: NavbarData;
  showSuccessMessage = false;

  /** Vista de solo lectura del menú de productos (viene del navbar observable) */
  productosMenuReadonly: { titulo: string; ruta?: string; items?: { nombre: string; ruta?: string }[] }[] = [];

  private subs = new Subscription();

  constructor(
    private navbarService: NavbarService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.resetForm();

    // Escuchar cambios del navbar para actualizar la vista de solo lectura
    this.subs.add(
      this.navbarService.navbarData$.subscribe(data => {
        this.productosMenuReadonly = data?.productosMenu ?? [];
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  trackByIndex(index: number): number {
    return index;
  }

  // ─── Títulos para expansion panels ────────────────────────────────────────

  getAboutItemTitle(index: number): string {
    return this.aboutMenuArray.at(index)?.get('nombre')?.value || '';
  }

  getSocialTitle(index: number): string {
    return this.redesArray.at(index)?.get('nombre')?.value || '';
  }

  // ─── Iconos sociales ──────────────────────────────────────────────────────

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

  // ─── Logo ─────────────────────────────────────────────────────────────────

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

  // ─── Guardar ──────────────────────────────────────────────────────────────

  saveChanges() {
    if (this.form.valid) {
      const v = this.form.value;

      // Preservar el productosMenu actual (no se edita desde aquí)
      const currentNavbar = this.navbarService.getNavbar();

      const updated: NavbarData = {
        productosLabel:    v.productosLabel,
        aboutLabel:        v.aboutLabel,
        contactoLabel:     v.contactoLabel,
        contactoRuta:      v.contactoRuta,
        siguenos:          v.siguenos,
        buscarPlaceholder: v.buscarPlaceholder,
        logoActual:        v.logoActual,
        aboutMenu: v.aboutMenu.map((i: any) => ({ nombre: i.nombre, ruta: i.ruta })),
        redes:     v.redes.map((r: any) => ({ nombre: r.nombre, icon: r.icon, url: r.url })),
        // ← Se preserva, no se modifica desde este editor
        productosMenu: currentNavbar.productosMenu
      };

      this.navbarService.updateNavbar(updated);
      this.showSuccessMessage = true;
      setTimeout(() => this.showSuccessMessage = false, 3000);
      this.originalData = JSON.parse(JSON.stringify(updated));
    }
  }

  // ─── Reset ────────────────────────────────────────────────────────────────

  resetForm() {
    const data = this.navbarService.getNavbar();
    this.originalData = JSON.parse(JSON.stringify(data));

    this.form = this.fb.group({
      productosLabel:    [data.productosLabel],
      aboutLabel:        [data.aboutLabel],
      contactoLabel:     [data.contactoLabel],
      contactoRuta:      [data.contactoRuta],
      siguenos:          [data.siguenos],
      buscarPlaceholder: [data.buscarPlaceholder],
      logoActual:        [data.logoActual],
      aboutMenu: this.fb.array(
        data.aboutMenu.map(i => this.fb.group({ nombre: [i.nombre], ruta: [i.ruta || ''] }))
      ),
      redes: this.fb.array(
        data.redes.map(r => this.fb.group({ nombre: [r.nombre], icon: [r.icon], url: [r.url] }))
      )
      // productosMenu no se incluye en el form — se gestiona desde Product General Editor
    });
  }

  // ─── Getters ──────────────────────────────────────────────────────────────

  get aboutMenuArray(): FormArray {
    return this.form.get('aboutMenu') as FormArray;
  }

  get redesArray(): FormArray {
    return this.form.get('redes') as FormArray;
  }

  // ─── About Menu ───────────────────────────────────────────────────────────

  addAboutItem() {
    this.aboutMenuArray.push(this.fb.group({ nombre: [''], ruta: [''] }));
  }

  removeAboutItem(index: number) {
    this.aboutMenuArray.removeAt(index);
  }

  // ─── Redes Sociales ───────────────────────────────────────────────────────

  addSocialItem() {
    this.redesArray.push(this.fb.group({ nombre: [''], icon: [''], url: [''] }));
  }

  removeSocialItem(index: number) {
    this.redesArray.removeAt(index);
  }
}