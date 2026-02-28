export interface NavbarLink {
  nombre: string;
  ruta?: string;
}

export interface NavbarCategory {
  titulo: string;
  ruta?: string;
  items: NavbarLink[];
}

export interface NavbarSocial {
  nombre: string;
  icon: string;
  url: string;
}

export interface NavbarData {
  productosLabel: string;
  aboutLabel: string;
  contactoLabel: string;
  contactoRuta: string;
  siguenos: string;
  buscarPlaceholder: string;
  aboutMenu: NavbarLink[];
  productosMenu: NavbarCategory[];
  redes: NavbarSocial[];
  logoActual: string;
}