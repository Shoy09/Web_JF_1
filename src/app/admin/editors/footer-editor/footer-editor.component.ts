import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FooterService } from '../../../services/footer.service';
import { FooterData } from '../../../models/footer.model';
import { NoticiasService } from '../../../services/noticias.service';

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
  editingNoticiaIndex = -1;

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
    private footerService: FooterService,
    private noticiasService: NoticiasService,
    private router: Router
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

  get menuIzquierdaArray(): FormArray { return this.footerForm.get('menuIzquierda') as FormArray; }
  get noticiasArray(): FormArray { return this.footerForm.get('noticias') as FormArray; }
  get redesArray(): FormArray { return this.footerForm.get('redes') as FormArray; }

  private toSlug(text: string): string {
    return text.trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }

  private buildUrl(titulo: string, fecha: string): string {
    const slug = this.toSlug(titulo);
    return slug ? `/noticias/${fecha}-${slug}` : '/noticias';
  }

  // ─── Noticias ─────────────────────────────────────────────────────────────

  addNoticia() {
    const fecha = this.today();
    this.noticiasArray.push(this.fb.group({
      fecha: [fecha],
      titulo: [''],
      url: ['/noticias']
    }));
    this.editingNoticiaIndex = this.noticiasArray.length - 1;
  }

  removeNoticia(index: number) {
    this.noticiasArray.removeAt(index);
    if (this.editingNoticiaIndex === index) this.editingNoticiaIndex = -1;
  }

  toggleEditNoticia(index: number) {
    this.editingNoticiaIndex = this.editingNoticiaIndex === index ? -1 : index;
  }

  onNoticiaTituloChange(index: number, event: Event) {
    const titulo = (event.target as HTMLInputElement).value;
    const fecha = this.noticiasArray.at(index).get('fecha')?.value || this.today();
    this.noticiasArray.at(index).get('url')?.setValue(this.buildUrl(titulo, fecha), { emitEvent: false });
  }

  // ✅ Guarda el draft en NoticiasService y navega al editor
  goToNoticiasEditor(index: number) {
    const noticia = this.noticiasArray.at(index).value;
    this.noticiasService.setDraft(noticia.titulo, noticia.fecha);
    this.saveChanges(); // guardar footer antes de salir
    this.router.navigate(['/admin/noticias']);
  }

  // ─── Form ─────────────────────────────────────────────────────────────────

  private setFormValues(data: FooterData) {
    this.footerForm.patchValue({
      telefono: data.contacto.telefono,
      email: data.contacto.email,
      logoCentro: data.logoCentro,
      copyright: data.copyright,
      followText: data.followText
    });

    this.menuIzquierdaArray.clear();
    data.menuIzquierda.forEach(item =>
      this.menuIzquierdaArray.push(this.fb.group({ label: [item.label], ruta: [item.ruta] }))
    );

    this.noticiasArray.clear();
    data.noticias.forEach(item =>
      this.noticiasArray.push(this.fb.group({ fecha: [item.fecha], titulo: [item.titulo], url: [item.url] }))
    );

    this.redesArray.clear();
    data.redes.forEach(item =>
      this.redesArray.push(this.fb.group({ icon: [item.icon], nombre: [item.nombre], url: [item.url] }))
    );
  }

  addMenuItem() { this.menuIzquierdaArray.push(this.fb.group({ label: [''], ruta: [''] })); }
  removeMenuItem(i: number) { this.menuIzquierdaArray.removeAt(i); }
  addRed() { this.redesArray.push(this.fb.group({ icon: [''], nombre: [''], url: [''] })); }
  removeRed(i: number) { this.redesArray.removeAt(i); }
  selectIcon(i: number, iconClass: string) { this.redesArray.at(i).get('icon')?.setValue(iconClass); }

  onLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => this.footerForm.get('logoCentro')?.setValue(e.target?.result as string);
    reader.readAsDataURL(file);
  }
  onLogoDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    this.onLogoSelected({ target: { files: [file] } } as any);
  }
  onDragOver(event: DragEvent): void { event.preventDefault(); }

  saveChanges() {
    const v = this.footerForm.value;
    const footerData: FooterData = {
      contacto: { telefono: v.telefono, email: v.email },
      logoCentro: v.logoCentro,
      menuIzquierda: v.menuIzquierda,
      noticias: v.noticias,
      redes: v.redes,
      copyright: v.copyright || 'JF Tricon Perú, LLC',
      followText: v.followText || 'SÍGUENOS EN —'
    };
    this.footerService.updateFooter(footerData);
    this.editingNoticiaIndex = -1;
    this.showSuccessMessage = true;
    setTimeout(() => this.showSuccessMessage = false, 3000);
  }

  resetForm() {
    this.setFormValues(this.footerService.getFooter());
    this.editingNoticiaIndex = -1;
  }

  trackByIndex(i: number): number { return i; }
}