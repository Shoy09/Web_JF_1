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
