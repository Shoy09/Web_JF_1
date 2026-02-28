import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { API_BASE_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class UsuarioService {

  constructor(private http: HttpClient) {}

  obtenerPerfil(): Observable<Usuario> {
    // ✅ Sin token manual — el interceptor lo agrega automáticamente
    return this.http.get<Usuario>(`${API_BASE_URL}/perfil`);
  }

  obtenerUsuarios(): Observable<Usuario[]> {
    // ✅ Sin token manual — el interceptor lo agrega automáticamente
    return this.http.get<Usuario[]>(API_BASE_URL);
  }
}