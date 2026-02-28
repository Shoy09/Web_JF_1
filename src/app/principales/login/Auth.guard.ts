import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = sessionStorage.getItem('authToken');

  if (!token) {
    router.navigate(['/login']); // Redirige al login
    return false;               // Bloquea el acceso
  }

  return true; // Token presente → permite acceso
};