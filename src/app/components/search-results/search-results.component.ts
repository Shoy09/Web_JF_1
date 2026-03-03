import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SearchService, SearchResult } from '../../services/search.service';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {

  query = '';
  resultados: SearchResult[] = [];
  buscando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.query = params['q'] || '';
      if (this.query) {
        this.buscando = true;
        setTimeout(() => {
          this.resultados = this.searchService.buscar(this.query);
          this.buscando = false;
        }, 200);
      }
    });
  }

  irA(url: string) {
    this.router.navigateByUrl(url);
  }

  getIcono(tipo: string): string {
    return tipo === 'noticia' ? '📰' : '🔩';
  }
}