// history.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HistoryData } from '../models/history.model';
import { API_BASE_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class HistoryService {

  private dataSubject = new BehaviorSubject<HistoryData | null>(null);
  data$ = this.dataSubject.asObservable();

  constructor(private http: HttpClient){
    this.loadInitial();
    this.loadFromBackend();
  }

  // =========================
  // CARGAR
  // =========================
  private loadInitial(){

    const saved = localStorage.getItem('historyData');

    if(saved){
      this.dataSubject.next(JSON.parse(saved));
      return;
    }

    // DATA DEFAULT
    const data: HistoryData = {
      heroTitle: 'NUESTRA HISTORIA',
      timeline: [
        {
          image: 'prueba.jpg',
          alt: 'Varel logo',
          stories: [
            { year: '1947', text: 'Fundación en Delaware' },
            { year: '1950', text: 'Producción inicial' }
          ]
        }
      ]
    };

    this.dataSubject.next(data);
  }

  // =========================
  // UPLOAD DE IMÁGENES BASE64 A CLOUDINARY
  // =========================

  async uploadImage(file: File, publicId: string = ''): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e: any) => {
        try {
          const base64 = e.target.result; // data:image/...;base64,...

          // Enviar base64 al backend
          const finalPublicId = publicId || `history_${Date.now()}`;
          
          const response = await this.http.post<{ secure_url: string }>(
            `${API_BASE_URL}/history/upload`,
            {
              imageData: base64,
              publicId: finalPublicId,
              folder: 'imagenes/history'
            }
          ).toPromise();

          if (response?.secure_url) {
            resolve(response.secure_url);
          } else {
            reject(new Error('No se recibió URL de Cloudinary'));
          }
        } catch (error: any) {
          reject(new Error(`Error al subir imagen: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };

      reader.readAsDataURL(file);
    });
  }

  // =========================
  // UPDATE
  // =========================
  update(data: HistoryData){

    const clone = JSON.parse(JSON.stringify(data));

    localStorage.setItem('historyData', JSON.stringify(clone));
    this.dataSubject.next(clone);

    console.log('🔥 history actualizado', clone);
    this.http.put(`${API_BASE_URL}/history`, clone).toPromise().catch(() => {});
  }

  getData(): HistoryData | null{
    return this.dataSubject.value;
  }

  private async loadFromBackend(): Promise<void> {
    try {
      const res = await this.http.get<HistoryData>(`${API_BASE_URL}/history`).toPromise();
      if (res) {
        localStorage.setItem('historyData', JSON.stringify(res));
        this.dataSubject.next(res);
      }
    } catch {}
  }
}