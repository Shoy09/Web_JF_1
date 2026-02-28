import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, AbstractControl } from '@angular/forms';
import { ContactService } from '../../../services/contact.service';
import { Region, ContactPageContent } from '../../../models/contact.model';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-contact-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './contact-editor.component.html',
  styleUrl: './contact-editor.component.css'
})
export class ContactEditorComponent implements OnInit {

  contactForm: FormGroup;
  regions: Region[] = [];
  content!: ContactPageContent;

  // 🔥 MENSAJE ÉXITO
  showSuccessMessage = false;

  fieldTypes = [
    { value: 'text', label: 'Texto' },
    { value: 'email', label: 'Email' },
    { value: 'number', label: 'Número' },
    { value: 'tel', label: 'Teléfono' },
    { value: 'textarea', label: 'Área de texto' }
  ];

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService
  ) {
    this.contactForm = this.fb.group({
      header: this.fb.group({
        subtitle: [''],
        title: [''],
        selectHelp: [''],
        regionLabel: [''],
        regionPlaceholder: ['']
      }),
      body: this.fb.group({
        leftTexts: this.fb.array([]),
        boldText: [''],
        formFields: this.fb.array([]),
        legalText: [''],
        sendButtonLabel: ['']
      }),
      regions: this.fb.array([])
    });
  }

    getTextPreview(control: AbstractControl): string {
    const value = control?.value;
    if (!value) return '';
    return value.length > 30 ? value.substring(0, 30) + '...' : value;
  }

  ngOnInit() {
    this.contactService.regions$.subscribe(regions => {
      this.regions = regions;
      this.setRegionsForm(regions);
    });

    this.contactService.content$.subscribe(content => {
      this.content = content;
      this.setContentForm(content);
    });
  }

  // getters
  get leftTextsArray() {
    return this.contactForm.get('body.leftTexts') as FormArray;
  }

  get formFieldsArray() {
    return this.contactForm.get('body.formFields') as FormArray;
  }

  get regionsArray() {
    return this.contactForm.get('regions') as FormArray;
  }

  private setContentForm(content: ContactPageContent) {
    this.contactForm.get('header')?.patchValue(content.header);

    const bodyGroup = this.contactForm.get('body') as FormGroup;

    this.leftTextsArray.clear();
    content.body.leftTexts.forEach(text => {
      this.leftTextsArray.push(this.fb.control(text));
    });

    this.formFieldsArray.clear();
    const defaultFields = content.body.formFields || [];

    for (let i = 0; i < 6; i++) {
      const field = defaultFields[i] || {};

      const fieldGroup = this.fb.group({
        label: [field.label || ''],
        placeholder: [field.placeholder || ''],
        type: [field.type || 'text'],
        rows: [field.rows || 6],
        required: [field.required || false]
      });

      this.formFieldsArray.push(fieldGroup);
    }

    bodyGroup.patchValue({
      boldText: content.body.boldText,
      legalText: content.body.legalText,
      sendButtonLabel: content.body.sendButtonLabel
    });
  }

  private setRegionsForm(regions: Region[]) {
    this.regionsArray.clear();
    regions.forEach(region => {
      const phonesArray = this.fb.array(
        region.contact.phones.map(phone => this.fb.control(phone))
      );

      const regionGroup = this.fb.group({
        value: [region.value],
        label: [region.label],
        contact: this.fb.group({
          name: [region.contact.name],
          phones: phonesArray,
          email: [region.contact.email],
          office: this.fb.group({
            country: [region.contact.office.country],
            address: [region.contact.office.address],
            phone: [region.contact.office.phone]
          })
        })
      });

      this.regionsArray.push(regionGroup);
    });
  }

  addLeftText() { this.leftTextsArray.push(this.fb.control('')); }
  removeLeftText(i: number) { this.leftTextsArray.removeAt(i); }

  addRegion() {
    const phonesArray = this.fb.array([this.fb.control('')]);

    const regionGroup = this.fb.group({
      value: [''],
      label: [''],
      contact: this.fb.group({
        name: [''],
        phones: phonesArray,
        email: [''],
        office: this.fb.group({
          country: [''],
          address: [''],
          phone: ['']
        })
      })
    });

    this.regionsArray.push(regionGroup);
  }

  removeRegion(i: number) { this.regionsArray.removeAt(i); }

  getPhonesArray(regionIndex: number): FormArray {
    return this.regionsArray.at(regionIndex).get('contact.phones') as FormArray;
  }

  addPhone(regionIndex: number) {
    this.getPhonesArray(regionIndex).push(this.fb.control(''));
  }

  removePhone(regionIndex: number, phoneIndex: number) {
    this.getPhonesArray(regionIndex).removeAt(phoneIndex);
  }

  // 🔥 GUARDAR
  saveChanges() {
    if (this.contactForm.valid) {
      const formValue = this.contactForm.value;

      const updatedContent: ContactPageContent = {
        header: {
          subtitle: formValue.header.subtitle || '',
          title: formValue.header.title || '',
          selectHelp: formValue.header.selectHelp || '',
          regionLabel: formValue.header.regionLabel || '',
          regionPlaceholder: formValue.header.regionPlaceholder || ''
        },
        body: {
          leftTexts: formValue.body.leftTexts || [],
          boldText: formValue.body.boldText || '',
          formFields: this.formFieldsArray.value.map((field: any) => ({
            label: field.label || '',
            placeholder: field.placeholder || '',
            type: field.type || 'text',
            rows: field.type === 'textarea' ? (field.rows || 6) : undefined,
            required: field.required || false
          })),
          legalText: formValue.body.legalText || '',
          sendButtonLabel: formValue.body.sendButtonLabel || ''
        }
      };

      const updatedRegions: Region[] = (formValue.regions || []).map((region: any) => ({
        value: region.value || '',
        label: region.label || '',
        contact: {
          name: region.contact?.name || '',
          phones: region.contact?.phones || [],
          email: region.contact?.email || '',
          office: {
            country: region.contact?.office?.country || '',
            address: region.contact?.office?.address || '',
            phone: region.contact?.office?.phone || ''
          }
        }
      }));

      this.contactService.updateContent(updatedContent);
      this.contactService.updateRegions(updatedRegions);

      console.log('✅ Cambios guardados exitosamente');

      // 🔥 MOSTRAR MENSAJE
      this.showSuccessMessage = true;

      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 2500);
    }
  }

  resetForm() {
    if (this.content && this.regions) {
      this.setContentForm(this.content);
      this.setRegionsForm(this.regions);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }
}