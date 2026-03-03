// models/masinfo.model.ts

export interface HeroSection {
  titulo: string;
  subtitulo: string;
  imagenFondo: string; // URL de Cloudinary
  boton?: {
    label: string;
    url: string;
  };
}

export interface ContentSection {
  titulo: string;
  parrafos: string[];
  imagen: string; // URL de Cloudinary
  reverse: boolean;
}

export interface InfoSection {
  titulo: string;
  parrafos: string[];
  imagen: string; // URL de Cloudinary
  reverse: boolean;
}

export interface BottomBanner {
  titulo: string;
  texto: string;
  imagen: string; // URL de Cloudinary
}

export interface MasInfoData {
  hero: HeroSection;
  contentSections: ContentSection[];
  sections: InfoSection[];
  bottomBanner?: BottomBanner;
}