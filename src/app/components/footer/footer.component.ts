import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { FooterService } from '../../services/footer.service';
import { FooterData } from '../../models/footer.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  imports: [CommonModule, RouterModule]
})
export class FooterComponent implements OnInit, AfterViewInit {
  footerData!: FooterData;
  currentYear: number = new Date().getFullYear();
  currentIndex: number = 0;
  private scrollListenerActive = false;

  @ViewChild('newsCarousel') newsCarousel!: ElementRef<HTMLDivElement>;

  constructor(
    private footerService: FooterService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.footerData = this.footerService.getFooter();
  }

  ngAfterViewInit(): void {
    if (this.newsCarousel) {
      // Inicializa el índice después de que la vista esté lista
      setTimeout(() => {
        this.updateCurrentIndex();
        this.setupScrollListener();
      });
    }
  }

  private setupScrollListener(): void {
    if (this.scrollListenerActive) return;
    
    this.scrollListenerActive = true;
    const carousel = this.newsCarousel.nativeElement;

    // Usar NgZone para optimizar la detección de cambios
    this.ngZone.runOutsideAngular(() => {
      carousel.addEventListener('scroll', this.handleScroll.bind(this));
    });
  }

  private handleScroll(): void {
    // Usar requestAnimationFrame para optimizar el rendimiento
    requestAnimationFrame(() => {
      this.ngZone.run(() => {
        this.updateCurrentIndex();
      });
    });
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLDivElement;
    const scrollLeft = target.scrollLeft;
    const firstItem = target.firstElementChild as HTMLElement;
    
    if (!firstItem) return;

    const itemWidth = firstItem.offsetWidth + parseInt(getComputedStyle(firstItem).marginRight || '0');
    const newIndex = Math.round(scrollLeft / itemWidth);
    
    if (newIndex !== this.currentIndex) {
      this.currentIndex = newIndex;
      // Forzar detección de cambios si es necesario
      this.cdr.detectChanges();
    }
  }

  updateCurrentIndex(): void {
    const carousel = this.newsCarousel?.nativeElement;
    if (!carousel) return;

    const children = Array.from(carousel.children) as HTMLElement[];
    if (!children.length) return;

    const carouselCenter = carousel.scrollLeft + carousel.offsetWidth / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    children.forEach((child, index) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const distance = Math.abs(carouselCenter - childCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (this.currentIndex !== closestIndex) {
      this.currentIndex = closestIndex;
      // Programar detección de cambios después de la actualización
      this.cdr.detectChanges();
    }
  }
}