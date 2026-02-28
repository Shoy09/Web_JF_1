import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { FooterService } from '../../../services/footer.service';
import { FooterData } from '../../../models/footer.model';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-footer-editor',
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
    MatTooltipModule,
    MatCheckboxModule
  ],
  templateUrl: './footer-editor.component.html',
  styleUrls: ['./footer-editor.component.css']
})
export class FooterEditorComponent implements OnInit {

  footerForm: FormGroup;
  showSuccessMessage = false;

  iconosSociales = [
    { class: 'bi bi-facebook',  nombre: 'Facebook' },
    { class: 'bi bi-instagram', nombre: 'Instagram' },
    { class: 'bi bi-twitter-x', nombre: 'X / Twitter' },
    { class: 'bi bi-linkedin',  nombre: 'LinkedIn' },
    { class: 'bi bi-youtube',   nombre: 'YouTube' },
    { class: 'bi bi-tiktok',    nombre: 'TikTok' },
    { class: 'bi bi-whatsapp',  nombre: 'WhatsApp' },
  ];

  constructor(
    private fb: FormBuilder,
    private footerService: FooterService
  ) {
    this.footerForm = this.fb.group({
      telefono: [''],
      email: [''],
      logoCentro: [''],
      copyright: [''],
      followText: [''],
      menuIzquierda: this.fb.array([]),
      noticias: this.fb.array([]),
      redes: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.footerService.footerData$.subscribe(data => {
      if (data) this.setFormValues(data);
    });
  }

  get menuIzquierdaArray(): FormArray {
    return this.footerForm.get('menuIzquierda') as FormArray;
  }

  get noticiasArray(): FormArray {
    return this.footerForm.get('noticias') as FormArray;
  }

  get redesArray(): FormArray {
    return this.footerForm.get('redes') as FormArray;
  }

  private setFormValues(data: FooterData) {
    this.footerForm.patchValue({
      telefono: data.contacto.telefono,
      email: data.contacto.email,
      logoCentro: data.logoCentro,
      copyright: data.copyright,
      followText: data.followText
    });

    this.menuIzquierdaArray.clear();
    data.menuIzquierda.forEach(item => {
      this.menuIzquierdaArray.push(this.fb.group({ label: [item.label], ruta: [item.ruta] }));
    });

    this.noticiasArray.clear();
    data.noticias.forEach(item => {
      this.noticiasArray.push(this.fb.group({ fecha: [item.fecha], titulo: [item.titulo], url: [item.url] }));
    });

    this.redesArray.clear();
    data.redes.forEach(item => {
      this.redesArray.push(this.fb.group({ icon: [item.icon], nombre: [item.nombre], url: [item.url] }));
    });
  }

  addMenuItem() {
    this.menuIzquierdaArray.push(this.fb.group({ label: [''], ruta: [''] }));
  }

  removeMenuItem(index: number) {
    this.menuIzquierdaArray.removeAt(index);
  }

  addNoticia() {
    this.noticiasArray.push(this.fb.group({ fecha: [''], titulo: [''], url: [''] }));
  }

  removeNoticia(index: number) {
    this.noticiasArray.removeAt(index);
  }

  addRed() {
    this.redesArray.push(this.fb.group({ icon: [''], nombre: [''], url: [''] }));
  }

  removeRed(index: number) {
    this.redesArray.removeAt(index);
  }

  selectIcon(index: number, iconClass: string) {
    this.redesArray.at(index).get('icon')?.setValue(iconClass);
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.footerForm.get('logoCentro')?.setValue(e.target?.result as string);
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

  saveChanges() {
    if (this.footerForm.valid) {
      const formValue = this.footerForm.value;
      const footerData: FooterData = {
        contacto: { telefono: formValue.telefono, email: formValue.email },
        logoCentro: formValue.logoCentro,
        menuIzquierda: formValue.menuIzquierda,
        noticias: formValue.noticias,
        redes: formValue.redes,
        copyright: formValue.copyright || 'JF Tricon Perú, LLC',
        followText: formValue.followText || 'SÍGUENOS EN —'
      };
      this.footerService.updateFooter(footerData);
      this.showSuccessMessage = true;
      setTimeout(() => this.showSuccessMessage = false, 3000);
    }
  }

  resetForm() {
    this.setFormValues(this.footerService.getFooter());
  }

  trackByIndex(index: number): number {
    return index;
  }
}