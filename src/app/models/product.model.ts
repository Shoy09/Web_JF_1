export interface Feature {
  title: string;
  description: string;
}

export interface Download {
  title: string;
  description: string;
  link?: string;
}

export interface Breadcrumb {
  label: string;
  link?: string;
}

export interface HeroProduct {
  breadcrumbs: Breadcrumb[];
  title: string;
  subtitle?: string;
  descriptions: string[];
  mainImage: string;
  thumbnails: string[];
  contactLink: string;
  features: Feature[];   
  downloads: Download[]; 
}