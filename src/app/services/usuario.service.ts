import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { API_BASE_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class UsuarioService {

  constructor(private http: HttpClient) {}

  obtenerPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${API_BASE_URL}/usuarios/perfil`);
  }

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${API_BASE_URL}/usuarios`);
  }

  crearUsuario(datos: Omit<Usuario, 'id'>): Observable<Usuario> {
    return this.http.post<Usuario>(`${API_BASE_URL}/usuarios`, datos);
  }

  actualizarUsuario(id: number, datos: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${API_BASE_URL}/usuarios/${id}`, datos);
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/usuarios/${id}`);
  }

  // Si tu backend usa un campo "activo" en el PUT úsalo así:
  toggleEstado(id: number, activo: boolean): Observable<Usuario> {
    return this.http.put<Usuario>(`${API_BASE_URL}/usuarios/${id}`, { activo });
  }
}