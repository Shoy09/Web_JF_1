import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { FooterService } from '../../services/footer.service';
import { FooterData } from '../../models/footer.model';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

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
    private ngZone: NgZone,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.footerService.footerData$.subscribe(data => {
      this.footerData = data;
      this.cdr.detectChanges();
    });
  }

  // ✅ CORRECCIÓN: acepta string | undefined
  navegarA(url: string | undefined): void {
    if (url && url !== '/noticias') {
      this.router.navigateByUrl(url);
    } else {
      this.router.navigate(['/noticias']);
    }
  }

  ngAfterViewInit(): void {
    if (this.newsCarousel) {
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
    this.ngZone.runOutsideAngular(() => {
      carousel.addEventListener('scroll', this.handleScroll.bind(this));
    });
  }

  private handleScroll(): void {
    requestAnimationFrame(() => {
      this.ngZone.run(() => { this.updateCurrentIndex(); });
    });
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLDivElement;
    const firstItem = target.firstElementChild as HTMLElement;
    if (!firstItem) return;
    const itemWidth = firstItem.offsetWidth + parseInt(getComputedStyle(firstItem).marginRight || '0');
    const newIndex = Math.round(target.scrollLeft / itemWidth);
    if (newIndex !== this.currentIndex) {
      this.currentIndex = newIndex;
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
      this.cdr.detectChanges();
    }
  }
}