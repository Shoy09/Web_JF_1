import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AboutService } from '../../services/about.service';
import { Subscription } from 'rxjs';

interface AboutSection {
  heroTitle: string;
  paragraphs: string[];
  paragraphs2: string[];
  subtitle?: string;
}

@Component({
  selector: 'app-acerca-de',
  standalone: true,
  imports: [TranslateModule, CommonModule, RouterModule],
  templateUrl: './acerca-de.component.html',
  styleUrls: ['./acerca-de.component.css']
})
export class AcercaDeComponent implements OnInit, OnDestroy {

  aboutData!: AboutSection;
  currentLanguage: string | undefined;
  private sub = new Subscription();

  constructor(
    private translate: TranslateService,
    private aboutService: AboutService
  ) {}

  ngOnInit(): void {

    // 🔥 ESCUCHA CAMBIOS EN TIEMPO REAL
    this.sub.add(
      this.aboutService.getAboutObservable().subscribe(data => {
        console.log('Acerca actualizado:', data);
        this.aboutData = data;
      })
    );

    const savedLang = localStorage.getItem('language') || 'es';
    this.currentLanguage = savedLang;
    this.translate.use(savedLang);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}