import { Component, OnInit } from '@angular/core';
import { Observable, map, startWith, debounceTime, distinctUntilChanged } from 'rxjs';
import { ContactService } from '../../services/contact.service';
import { Region, ContactPageContent } from '../../models/contact.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // <-- IMPORTAR ESTO

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
    MatProgressSpinnerModule // <-- AGREGAR AQUÍ
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  regionControl = new FormControl('');
  selectedRegion: Region | null = null;
  private isFromAutocomplete = false;

  regions: Region[] = [];
  filteredRegions!: Observable<Region[]>;
  
  // INICIALIZAR content con un objeto vacío
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

  constructor(private contactService: ContactService) {}

  ngOnInit() {
    this.contactService.regions$.subscribe(data => {
      this.regions = data;
      this.setupFilteredRegions();
    });

    this.contactService.content$.subscribe(data => {
      this.content = data;
    });

    this.setupFilteredRegions();
    this.setupValueChanges();
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
    return !filterValue ? this.regions : this.regions.filter(region =>
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
}