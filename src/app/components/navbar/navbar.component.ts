import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink, RouterModule } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { NavbarService } from '../../services/navbar.service';
import { NavbarData } from '../../models/navbar.model';

@Component({
  selector: 'app-nvbar',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  // ===============================
  // DATA DEL ADMIN
  // ===============================
  navbarData!: NavbarData;
  aboutMenu: any[] = [];
  productosMenu: any[] = [];
  redes: any[] = [];
  logoActual = '';

  // ===============================
  // ESTADOS DEL MENÚ
  // ===============================
  menuOpen = false;
  showProductos = false;
  showAbout = false;
  searchOpen = false;
  isProductPage = false;
  isContactPage = false;
  isNoticiasPage = false;
  isAboutPage = false;

  // ===============================
  // RESPONSIVE
  // ===============================
  isMobileView = false;
  private readonly MOBILE_WIDTH = 768;

  // ===============================
  // IDIOMAS
  // ===============================
  languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'pt', label: 'Português' }
  ];
  currentLang = 'en';
  langDropdownOpen = false;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private navbarService: NavbarService
  ) {
    this.translate.setDefaultLang('en');
  }

  // ===============================
  // INIT
  // ===============================
  ngOnInit() {
    this.updateViewMode();
    
    const savedLang = localStorage.getItem('language') || 'en';
    this.currentLang = savedLang;
    this.translate.use(this.currentLang);
    
    this.checkProductPage();
    this.loadNavbar();
    
    this.navbarService.navbarData$.subscribe(data => {
      this.applyNavbarData(data);
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkProductPage();
      });
  }

  // ===============================
  // NAVBAR DATA
  // ===============================
  loadNavbar() {
    const data = this.navbarService.getNavbar();
    this.applyNavbarData(data);
  }

  applyNavbarData(data: NavbarData) {
    this.navbarData = data;
    this.aboutMenu = data.aboutMenu;
    this.productosMenu = data.productosMenu;
    this.redes = data.redes;
    this.logoActual = data.logoActual;
  }

  // ===============================
  // RUTAS
  // ===============================
  private checkProductPage() {
    const url = this.router.url;
    this.isProductPage = url.includes('/producto') || url.includes('/productos');
    this.isContactPage = url.includes('/contactos');
    this.isNoticiasPage = url.toLowerCase().includes('/noticias');
    this.isAboutPage = url.includes('/acerca-de');
  }

  // ===============================
  // RESPONSIVE
  // ===============================
  private updateViewMode() {
    this.isMobileView = window.innerWidth <= this.MOBILE_WIDTH;
    
    if (!this.isMobileView) {
      this.menuOpen = false;
      this.showProductos = false;
      this.showAbout = false;
      this.searchOpen = false;
      this.langDropdownOpen = false;
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.updateViewMode();
  }

  // ===============================
  // MENÚ PRINCIPAL
  // ===============================
  toggleMenu() {
    if (!this.isMobileView) return;
    this.menuOpen = !this.menuOpen;
    
    if (!this.menuOpen) {
      this.showProductos = false;
      this.showAbout = false;
    }
  }

  toggleProductos(event?: Event) {
    if (event) event.preventDefault();
    this.showProductos = !this.showProductos;
    this.showAbout = false;
    
    if (this.isMobileView && !this.menuOpen) {
      this.menuOpen = true;
    }
  }

  toggleAbout(event?: Event) {
    if (event) event.preventDefault();
    this.showAbout = !this.showAbout;
    this.showProductos = false;
    
    if (this.isMobileView && !this.menuOpen) {
      this.menuOpen = true;
    }
  }

  closeMenus() {
    if (!this.isMobileView) return;
    this.menuOpen = false;
    this.showProductos = false;
    this.showAbout = false;
  }

  cerrarMegaMenu() {
    this.showProductos = false;
  }

  cerrarMegaAbout() {
    this.showAbout = false;
  }

  cerrarMenusAlNavegar() {
    this.showProductos = false;
    this.showAbout = false;
    this.menuOpen = false;
    this.searchOpen = false;
  }

  // ===============================
  // BÚSQUEDA
  // ===============================
  toggleSearch() {
    if (!this.isMobileView) return;
    this.searchOpen = !this.searchOpen;
  }

  // ===============================
  // IDIOMAS
  // ===============================
  toggleLangDropdown() {
    this.langDropdownOpen = !this.langDropdownOpen;
  }

  selectLanguage(langCode: string) {
    this.currentLang = langCode;
    localStorage.setItem('language', langCode);
    this.translate.use(langCode);
    this.langDropdownOpen = false;
  }

  closeLangDropdown() {
    this.langDropdownOpen = false;
  }

  get currentLanguageLabel(): string {
    const lang = this.languages.find(l => l.code === this.currentLang);
    return lang ? lang.label : '';
  }
}