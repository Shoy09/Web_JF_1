export interface ProductItem {
  title: string;
  image: string;
  link: string;
}
export interface HeaderData {
  titulo: string;
  descripcion: string;
  breadcrumbs: string[];
}
export interface InfoButton {
  label: string;
  link: string;
}
export interface InfoSection {
  texto: string;
  boton: InfoButton;
}
export interface GeneralProductData {
  headerData: HeaderData;
  infoSection: InfoSection;
  products: ProductItem[];
}
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
  ruta?: string;        // ← NUEVO
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