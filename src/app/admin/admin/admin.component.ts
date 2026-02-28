import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {

  constructor(private readonly router: Router) {}

  cerrarSesion(): void {
    // Borra el token del sessionStorage
  sessionStorage.removeItem('authToken'); // ← también sessionStorage
    // Redirige al login
    this.router.navigate(['/login']);
  }
}