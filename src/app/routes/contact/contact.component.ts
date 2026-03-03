// contact.component.ts
import { Component, OnInit } from '@angular/core';
import { Observable, map, startWith, debounceTime, distinctUntilChanged } from 'rxjs';
import { ContactService } from '../../services/contact.service';
import { Region, ContactPageContent } from '../../models/contact.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../api.config';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MAT_AUTOCOMPLETE_SCROLL_STRATEGY } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Overlay } from '@angular/cdk/overlay';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  providers: [
    {
      provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
      useFactory: (overlay: Overlay) => () => overlay.scrollStrategies.close(),
      deps: [Overlay]
    }
  ]
})
export class ContactComponent implements OnInit {

  regionControl = new FormControl('');
  selectedRegion: Region | null = null;
  private isFromAutocomplete = false;

  regions: Region[] = [];
  filteredRegions!: Observable<Region[]>;

  isSending = false;

  contactForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName:  new FormControl('', [Validators.required]),
    email:     new FormControl('', [Validators.required, Validators.email]),
    phone:     new FormControl(''),
    company:   new FormControl(''),
    message:   new FormControl('', [Validators.required])
  });

  content: ContactPageContent = {
    header: {
      subtitle: '',
      title: '',
      selectHelp: '',
      regionLabel: '',
      regionPlaceholder: ''
    },
    body: {
      leftTexts: [],
      boldText: '',
      formFields: [],
      legalText: '',
      sendButtonLabel: ''
    }
  };

  constructor(
    private contactService: ContactService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    const containers = document.querySelectorAll('.cdk-overlay-container');
    containers.forEach((container, index) => {
      if (index > 0) container.remove();
    });
  }

  ngOnInit() {
    this.setupFilteredRegions();
    this.setupValueChanges();

    this.contactService.regions$.subscribe(data => {
      this.regions = data;
      const currentValue = this.regionControl.value || '';
      this.regionControl.setValue(currentValue, { emitEvent: true });
    });

    this.contactService.content$.subscribe(data => {
      this.content = data;
    });
  }

  private setupFilteredRegions() {
    this.filteredRegions = this.regionControl.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      map(value => this.isFromAutocomplete ?
        (this.isFromAutocomplete = false, this.regions) :
        this.filterRegions(value || ''))
    );
  }

  private setupValueChanges() {
    this.regionControl.valueChanges.subscribe(value => {
      if (typeof value === 'string' && !value.trim()) {
        this.selectedRegion = null;
      }
    });
  }

  private filterRegions(value: string): Region[] {
    const filterValue = value.toLowerCase().trim();
    return !filterValue
      ? this.regions
      : this.regions.filter(region =>
          region.label.toLowerCase().includes(filterValue) ||
          region.contact.name.toLowerCase().includes(filterValue) ||
          region.contact.office.country.toLowerCase().includes(filterValue)
        );
  }

  selectRegion(region: Region) {
    this.isFromAutocomplete = true;
    this.selectedRegion = region;
    this.regionControl.setValue(region.label, { emitEvent: false });
  }

  clearRegion() {
    this.regionControl.setValue('');
    this.selectedRegion = null;
    this.isFromAutocomplete = false;
  }

  displayFn(region: Region): string {
    return region ? region.label : '';
  }

  get canSubmit(): boolean {
    return !!this.selectedRegion && this.contactForm.valid && !this.isSending;
  }

  onSubmit() {
    if (!this.canSubmit) return;

    this.isSending = true;

    const payload = {
      ...this.contactForm.value,
      toEmail:     this.selectedRegion!.contact.email,
      region:      this.selectedRegion!.label,
      contactName: this.selectedRegion!.contact.name
    };

    // ═══════════════════════════════════════════════════════════════════════
    // CAMBIO: Enviar a BD en lugar de correo
    // ═══════════════════════════════════════════════════════════════════════
    this.http.post(`${API_BASE_URL}/contact-messages`, payload).subscribe({
      next: () => {
        this.snackBar.open('✅ Mensaje enviado correctamente!', 'Cerrar', {
          duration: 4000,
          panelClass: ['snack-success']
        });
        this.contactForm.reset();
        this.isSending = false;
      },
      error: () => {
        this.snackBar.open('❌ Error al enviar. Intenta nuevamente.', 'Cerrar', {
          duration: 4000,
          panelClass: ['snack-error']
        });
        this.isSending = false;
      }
    });
  }
}