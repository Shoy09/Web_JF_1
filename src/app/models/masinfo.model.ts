export interface HeroSection {
  titulo: string;
  subtitulo: string;
  imagenFondo: string;
  boton?: { label: string; url: string };
}

export interface InfoSection {
  titulo: string;
  parrafos: string[];
  imagen?: string;
  reverse?: boolean;
}

export interface BottomBanner {
  titulo: string;
  texto: string;
  imagen: string;
}

export interface MasInfoData {
  hero: HeroSection;
  contentSections: InfoSection[];
  sections: InfoSection[];
  bottomBanner?: BottomBanner;
}