import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../api.config';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  correo:       string  = '';
  password:     string  = '';
  showPassword: boolean = false;
  isLoading:    boolean = false;
  errorMessage: string  = '';

private readonly API_URL = `${API_BASE_URL}/login`;

  constructor(
    private readonly router: Router,
    private readonly http: HttpClient
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    this.errorMessage = '';

    if (!this.correo || !this.password) {
      this.errorMessage = 'Por favor, completa todos los campos.';
      return;
    }

    this.isLoading = true;

    this.http.post<{ token: string }>(this.API_URL, {
      correo:   this.correo,
      password: this.password
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response?.token) {
        sessionStorage.setItem('authToken', response.token); // ← cambia localStorage por sessionStorage
          this.router.navigate(['/admin/home']);
        } else {
          this.errorMessage = 'Respuesta inesperada del servidor.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 400) {
          this.errorMessage = 'Correo o contraseña incorrectos.';
        } else if (err.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor.';
        } else {
          this.errorMessage = 'Error al iniciar sesión. Intenta de nuevo.';
        }
      }
    });
  }
}