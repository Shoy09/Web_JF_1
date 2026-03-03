import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Rutas públicas: solo GET no necesita token
// PUT, POST, DELETE siempre llevan token
const PUBLIC_GET_URLS = [
  '/general-product-page',
  '/products/by-ruta',
  '/products',
  '/footer',
  '/navbar',
  '/home',
  '/about',
  '/history',
  '/noticias',
  '/mas-info',
  '/contact-page',
];

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    // GET a rutas públicas no necesita token
    const isPublicGet = req.method === 'GET' &&
      PUBLIC_GET_URLS.some(url => req.url.includes(url));

    const cloned = (token && !isPublicGet)
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
}