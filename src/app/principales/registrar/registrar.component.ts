import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { API_BASE_URL } from '../../api.config';

@Component({
  selector: 'app-registrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registrar.component.html',
  styleUrls: ['./registrar.component.css']
})
export class RegistrarComponent {

  registerForm: FormGroup;
  loading = false;
  apiUrl = API_BASE_URL;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      codigo_dni: ['', Validators.required],
      apellidos: ['', Validators.required],
      nombres: ['', Validators.required],
      cargo: [''],
      rol: ['usuario'], // rol por defecto
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  register() {
    if (this.registerForm.invalid) {
      alert('Por favor completa todos los campos correctamente.');
      return;
    }

    this.loading = true;

    const token = localStorage.getItem('token');
    if (!token) {
      this.loading = false;
      alert('Debes iniciar sesión como administrador para crear usuarios.');
      this.router.navigate(['/login']);
      return;
    }
    const usuarioStr = localStorage.getItem('usuario');
    try {
      const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
      if (!usuario || usuario.rol !== 'admin') {
        this.loading = false;
        alert('Solo un administrador puede crear usuarios.');
        this.router.navigate(['/home']);
        return;
      }
    } catch {
      // Si no se puede parsear, pedimos login nuevamente
      this.loading = false;
      alert('Sesión inválida. Inicia sesión nuevamente.');
      this.router.navigate(['/login']);
      return;
    }

    this.http.post(`${this.apiUrl}/usuarios`, this.registerForm.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          alert(res.message || 'Usuario creado correctamente');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.loading = false;

          // Mostrar mensaje detallado si existe
          if (err.error) {
            if (err.error.error) {
              alert('Error: ' + err.error.error);
            } else if (err.error.detalle) {
              alert('Error: ' + err.error.detalle);
            } else {
              alert('Error desconocido al crear usuario');
            }
          } else {
            alert('Error al crear usuario');
          }

          console.error('Error al registrar usuario:', err);
        }
      });
  }
}
