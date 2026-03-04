import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd, RouterLink, RouterModule } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { NavbarService } from '../../services/navbar.service';
import { NavbarData } from '../../models/navbar.model';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-nvbar',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterLink, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  @ViewChild('navbarEl')       navbarEl!:       ElementRef;
  @ViewChild('megaProductos')  megaProductos!:  ElementRef;
  @ViewChild('megaAbout')      megaAbout!:      ElementRef;

  navbarData!: NavbarData;
  aboutMenu: any[] = [];
  productosMenu: any[] = [];
  redes: any[] = [];
  logoActual = '';

  menuOpen = false;
  showProductos = false;
  showAbout = false;
  searchOpen = false;
  isProductPage = false;
  isContactPage = false;
  isNoticiasPage = false;
  isAboutPage = false;
  isBuscarPage = false;

  isMobileView = false;
  private readonly MOBILE_WIDTH = 768;
  private closeTimer: any = null;

  // ✅ Búsqueda
  searchQuery = '';

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
    private navbarService: NavbarService,
    private searchService: SearchService
  ) {
    this.translate.setDefaultLang('en');
  }

  ngOnInit() {
    this.updateViewMode();
    const savedLang = localStorage.getItem('language') || 'en';
    this.currentLang = savedLang;
    this.translate.use(this.currentLang);
    this.checkProductPage();
    this.loadNavbar();
    this.navbarService.navbarData$.subscribe(data => this.applyNavbarData(data));
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.checkProductPage());
  }

  ngOnDestroy() {
    this.limpiarTimer();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isMobileView) return;
    if (!this.showProductos && !this.showAbout) return;
    const x = event.clientX;
    const y = event.clientY;
    const dentroDeNav = this.enZona(this.navbarEl, x, y);
    const megaActivo = this.showProductos ? this.megaProductos : this.megaAbout;
    const dentroDelMega = this.enZona(megaActivo, x, y);
    if (dentroDeNav || dentroDelMega) {
      this.limpiarTimer();
    } else {
      this.iniciarCierre();
    }
  }

  private enZona(ref: ElementRef | undefined, x: number, y: number): boolean {
    if (!ref?.nativeElement) return false;
    const r = ref.nativeElement.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  private iniciarCierre() {
    if (this.closeTimer) return;
    this.closeTimer = setTimeout(() => {
      this.showProductos = false;
      this.showAbout = false;
      this.closeTimer = null;
    }, 200);
  }

  private limpiarTimer() {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

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

  private checkProductPage() {
    const url = this.router.url;
    this.isProductPage  = url.includes('/producto') || url.includes('/productos');
    this.isContactPage  = url.includes('/contactos');
    this.isNoticiasPage = url.toLowerCase().includes('/noticias');
    this.isAboutPage    = url.includes('/acerca-de');
    this.isBuscarPage   = url.includes('/buscar'); 
  }

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
    this.limpiarTimer();
    this.showProductos = !this.showProductos;
    this.showAbout = false;
    if (this.isMobileView && !this.menuOpen) this.menuOpen = true;
  }

  toggleAbout(event?: Event) {
    if (event) event.preventDefault();
    this.limpiarTimer();
    this.showAbout = !this.showAbout;
    this.showProductos = false;
    if (this.isMobileView && !this.menuOpen) this.menuOpen = true;
  }

  cerrarMenusAlNavegar() {
    this.limpiarTimer();
    this.showProductos = false;
    this.showAbout = false;
    this.menuOpen = false;
    this.searchOpen = false;
    this.searchQuery = '';
  }

  // ===============================
  // BÚSQUEDA
  // ===============================
  toggleSearch() {
    this.searchOpen = !this.searchOpen;
    if (!this.searchOpen) this.searchQuery = '';
  }

ejecutarBusqueda(event?: KeyboardEvent) {
  if (event && event.key !== 'Enter') return;
  const q = this.searchQuery.trim();
  if (!q) return;

  // ✅ Guardar query ANTES de limpiar
  this.cerrarMenusAlNavegar(); // ← correcto, sin el label
  this.router.navigate(['/buscar'], { queryParams: { q } });
  this.searchQuery = '';
  this.searchOpen = false;
}

  // ===============================
  // IDIOMAS
  // ===============================
  toggleLangDropdown() { this.langDropdownOpen = !this.langDropdownOpen; }

  selectLanguage(langCode: string) {
    this.currentLang = langCode;
    localStorage.setItem('language', langCode);
    this.translate.use(langCode);
    this.langDropdownOpen = false;
  }

  closeLangDropdown() { this.langDropdownOpen = false; }

  get currentLanguageLabel(): string {
    return this.languages.find(l => l.code === this.currentLang)?.label ?? '';
  }
}