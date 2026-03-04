import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SearchService, SearchResult } from '../../services/search.service';
import { NavbarService } from '../../services/navbar.service';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit, OnDestroy {

  query = '';
  resultados: SearchResult[] = [];
  buscando = false;

  private subs = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private navbarService: NavbarService
  ) {}

ngOnInit() {
  console.log('🚀 Componente iniciado');
  
  this.subs.add(
    this.route.queryParams.subscribe(params => {
      console.log('📌 Params recibidos:', params);
      this.query = params['q'] || '';
      console.log('📌 Query:', this.query);
      if (this.query) {
        this.ejecutarBusqueda();
      }
    })
  );
}

private ejecutarBusqueda() {
  this.buscando = true;
  this.resultados = [];

  console.log('🔍 Query recibido:', this.query);

  this.subs.add(
    this.navbarService.navbarData$.pipe(
      filter(navbar => {
        console.log('📡 navbarData$ emitió:', navbar);
        console.log('📦 productosMenu:', navbar?.productosMenu);
        return !!(navbar?.productosMenu?.length);
      }),
      take(1)
    ).subscribe(() => {
      this.resultados = this.searchService.buscar(this.query);
      console.log('✅ Resultados:', this.resultados);
      this.buscando = false;
    })
  );

  setTimeout(() => {
    if (this.buscando) {
      console.log('⏱ Timeout alcanzado, buscando igual...');
      this.resultados = this.searchService.buscar(this.query);
      console.log('✅ Resultados por timeout:', this.resultados);
      this.buscando = false;
    }
  }, 3000);
}

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  irA(url: string) {
    this.router.navigateByUrl(url);
  }

  getIcono(tipo: string): string {
    return tipo === 'noticia' ? '📰' : '🔩';
  }
  buscarDesdeHeader() {
  if (!this.query.trim()) return;
  this.router.navigate(['/buscar'], { queryParams: { q: this.query.trim() } });
}
}