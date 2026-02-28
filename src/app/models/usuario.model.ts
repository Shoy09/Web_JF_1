export interface Usuario {
  id?: number;
  codigo_dni: string;
  apellidos: string;
  nombres: string;
  cargo?: string;
  rol?: string;
  correo?: string;
  password?: string;
}

export interface LoginRequest {
  codigo_dni: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario?: Usuario;
}