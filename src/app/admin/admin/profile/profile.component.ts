import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_BASE_URL } from '../../../api.config'; // ajusta ruta si es necesario

interface Usuario {
  id: number;
  codigo_dni: string;
  apellidos: string;
  nombres: string;
  cargo?: string;
  rol?: string;
  correo?: string;
  foto?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  usuario: Usuario | null = null;
  isLoading = true;
  savingDatos = false;
  savingPass = false;
  successMessage = '';
  errorMessage = '';
  passError = '';
  avatarPreview: string | null = null;
  showNewPass = false;
  showConfirmPass = false;

  form = {
    nombres: '',
    apellidos: '',
    correo: '',
    cargo: ''
  };

  passForm = {
    newPassword: '',
    confirmPassword: ''
  };

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    const token = sessionStorage.getItem('authToken');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.isLoading = true;
    this.http.get<Usuario>(`${API_BASE_URL}/usuarios/perfil`, { headers: this.headers })
      .subscribe({
        next: (data) => {
          this.usuario = data;
          this.form = {
            nombres:   data.nombres,
            apellidos: data.apellidos,
            correo:    data.correo  || '',
            cargo:     data.cargo   || ''
          };
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'No se pudo cargar el perfil.';
          this.isLoading = false;
        }
      });
  }

  resetDatos(): void {
    if (this.usuario) {
      this.form = {
        nombres:   this.usuario.nombres,
        apellidos: this.usuario.apellidos,
        correo:    this.usuario.correo  || '',
        cargo:     this.usuario.cargo   || ''
      };
    }
  }

  guardarDatos(): void {
    if (!this.usuario) return;
    this.savingDatos = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.http.put(
      `${API_BASE_URL}/usuarios/${this.usuario.id}`,
      this.form,
      { headers: this.headers }
    ).subscribe({
      next: () => {
        this.savingDatos = false;
        this.usuario = { ...this.usuario!, ...this.form };
        this.mostrarExito('Datos actualizados correctamente');
      },
      error: () => {
        this.savingDatos = false;
        this.mostrarError('Error al actualizar los datos.');
      }
    });
  }

  resetPass(): void {
    this.passForm = { newPassword: '', confirmPassword: '' };
    this.passError = '';
  }

  cambiarPassword(): void {
    this.passError = '';

    if (this.passForm.newPassword.length < 6) {
      this.passError = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (this.passForm.newPassword !== this.passForm.confirmPassword) {
      this.passError = 'Las contraseñas no coinciden.';
      return;
    }

    if (!this.usuario) return;
    this.savingPass = true;

    this.http.put(
      `${API_BASE_URL}/usuarios/${this.usuario.id}`,
      { password: this.passForm.newPassword },
      { headers: this.headers }
    ).subscribe({
      next: () => {
        this.savingPass = false;
        this.resetPass();
        this.mostrarExito('Contraseña actualizada correctamente');
      },
      error: () => {
        this.savingPass = false;
        this.mostrarError('Error al cambiar la contraseña.');
      }
    });
  }

  onFotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview = reader.result as string;
    };
    reader.readAsDataURL(file);

    // Si tu backend tiene endpoint para subir foto, descomenta esto:
    // const formData = new FormData();
    // formData.append('foto', file);
    // this.http.post(`${API_BASE_URL}/usuarios/${this.usuario!.id}/foto`, formData, { headers: ... })
  }

  private mostrarExito(msg: string): void {
    this.successMessage = msg;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 3000);
  }

  private mostrarError(msg: string): void {
    this.errorMessage = msg;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 4000);
  }
}