export interface FooterLink {
  label: string;
  ruta?: string;
}

export interface FooterNews {
  fecha: string;
  titulo: string;
  url?: string;
}

export interface FooterSocial {
  icon: string;
  url: string;
  nombre: string;
}

export interface FooterContact {
  telefono: string;
  email: string;
}

export interface FooterData {
  menuIzquierda: FooterLink[];
  noticias: FooterNews[];
  logoCentro: string;
  contacto: FooterContact;
  redes: FooterSocial[];
  copyright: string;
  followText: string;
}