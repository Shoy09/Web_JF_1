import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { HomeService } from '../../services/home.service';
import { HomeData, Card, AboutSection, HeroSection } from '../../models/home.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  dropdownOpen = false;

  languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'pt', label: 'Português' }
  ];
  currentLanguage: string = 'en';

  private destroy$ = new Subject<void>();

  // 🔥 DATA REAL (del editor)
  hero!: HeroSection;
  cards: Card[] = [];
  about!: AboutSection;

  constructor(
    private translate: TranslateService,
    private homeService: HomeService
  ) {}

  ngOnInit() {
    // idioma
    const savedLang = localStorage.getItem('language') || 'en';
    this.currentLanguage = savedLang;
    this.translate.use(savedLang);

    // 🔥 cargar data del editor
    this.loadHomeData();
  }

  loadHomeData() {
    const data: HomeData = this.homeService.getHome();
    this.hero = data.hero;
    this.cards = data.cards;
    this.about = data.about;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===============================
  // DROPDOWN
  // ===============================
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;

    if (this.dropdownOpen) {
      document.body.classList.add('language-open');
    } else {
      document.body.classList.remove('language-open');
    }
  }

  closeDropdown() {
    this.dropdownOpen = false;
    document.body.classList.remove('language-open');
  }

  selectLanguage(langCode: string) {
    this.currentLanguage = langCode;
    localStorage.setItem('language', langCode);
    this.translate.use(langCode);
    this.closeDropdown();
  }

  get currentLanguageLabel(): string {
    const lang = this.languages.find(l => l.code === this.currentLanguage);
    return lang ? lang.label : '';
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.dropdownOpen && window.scrollY > 350) {
      this.closeDropdown();
    }
  }
}