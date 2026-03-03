export type ParrafoItem =
  | { tipo: 'texto'; contenido: string }
  | { tipo: 'imagen'; url: string; alt?: string };

export interface Noticia {
  id: number;
  categoria: string;
  titulo: string;
  fechaPublicacion: string;
  parrafos: ParrafoItem[];
  contactoNombre: string;
  contactoEmail: string;
  firmaNombre: string;
  firmaCargo: string;
  slug?: string;
  visible?: boolean; // ✅ controla si aparece en el footer
}