import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MasInfoService } from '../../services/mas-info.service';
import { MasInfoData, HeroSection, InfoSection, BottomBanner } from '../../models/masinfo.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-mas-info',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './mas-info.component.html',
  styleUrls: ['./mas-info.component.css']
})
export class MasInfoComponent implements OnInit {

  heroSection: HeroSection | null = null;
  contentSections: InfoSection[] = [];
  infoSections: InfoSection[] = [];
  bottomBanner?: BottomBanner;

  constructor(private masInfoService: MasInfoService) {}

  ngOnInit(): void {
    this.masInfoService.data$.subscribe(data => {
      if (!data) return;

      this.heroSection = data.hero || null;
      this.contentSections = data.contentSections || [];
      this.infoSections = data.sections || [];
      this.bottomBanner = data.bottomBanner;
    });
  }
  getAllSections(): InfoSection[] {
  const content = this.contentSections?.slice(1) || [];
  const info = this.infoSections || [];
  return [...content, ...info];
}
}