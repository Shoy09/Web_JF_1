import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { API_BASE_URL } from '../../../api.config';

@Component({
  selector: 'app-Emailconfig-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './Emailconfig-editor.component.html',
  styleUrls: ['./Emailconfig-editor.component.css']
})
export class EmailConfigEditorComponent implements OnInit {
  private readonly API_URL = `${API_BASE_URL}/admin-email-config`;

  config = {
    fromEmail: '',
    subject: '',
    htmlTemplate: ''
  };

  loading = false;
  isSaving = false;
  message = '';
  isSuccess = false;

  defaultConfig = {
    fromEmail: 'contacto@tudominio.com',
    subject: 'Nuevo contacto: {firstName} {lastName}',
    htmlTemplate: `
      <h2>Nuevo Mensaje de Contacto</h2>
      <p><strong>Región:</strong> {region}</p>
      <p><strong>De:</strong> {firstName} {lastName}</p>
      <p><strong>Email:</strong> <a href="mailto:{email}">{email}</a></p>
      <p><strong>Empresa:</strong> {company}</p>
      <hr />
      <p><strong>Mensaje:</strong></p>
      <p>{message}</p>
    `
  };

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadConfig();
  }

  // ============================================
  // CARGAR CONFIGURACIÓN
  // ============================================
  loadConfig() {
    this.loading = true;
    this.http.get(this.API_URL).subscribe({
      next: (data: any) => {
        this.config = {
          fromEmail: data.fromEmail || this.defaultConfig.fromEmail,
          subject: data.subject || this.defaultConfig.subject,
          htmlTemplate: data.htmlTemplate || this.defaultConfig.htmlTemplate
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar config:', error);
        this.message = '❌ Error al cargar configuración';
        this.isSuccess = false;
        this.loading = false;
      }
    });
  }

  // ============================================
  // GUARDAR CONFIGURACIÓN
  // ============================================
  saveConfig() {
    if (!this.isFormValid()) {
      this.message = '❌ Por favor completa todos los campos';
      this.isSuccess = false;
      return;
    }

    this.isSaving = true;
    this.http.post(this.API_URL, this.config).subscribe({
      next: () => {
        this.message = '✅ Configuración guardada correctamente';
        this.isSuccess = true;
        this.isSaving = false;
        
        this.snackBar.open('✅ Configuración de email actualizada', 'Cerrar', {
          duration: 4000,
          panelClass: ['snack-success']
        });
      },
      error: (error) => {
        console.error('Error al guardar:', error);
        this.message = '❌ Error al guardar: ' + (error.error?.message || error.message);
        this.isSuccess = false;
        this.isSaving = false;
      }
    });
  }

  // ============================================
  // RESTAURAR VALORES POR DEFECTO
  // ============================================
  resetToDefaults() {
    if (confirm('¿Estás seguro? Esto restaurará la configuración a los valores por defecto.')) {
      this.config = JSON.parse(JSON.stringify(this.defaultConfig));
      this.message = '';
    }
  }

  // ============================================
  // VALIDAR FORMULARIO
  // ============================================
  isFormValid(): boolean {
    return !!(
      this.config.fromEmail?.trim() &&
      this.config.subject?.trim() &&
      this.config.htmlTemplate?.trim()
    );
  }

  // ============================================
  // VISTA PREVIA - SUBJECT
  // ============================================
  getPreviewSubject(): string {
    return this.replaceVariables(this.config.subject, {
      firstName: 'Juan',
      lastName: 'Pérez',
      region: 'Sudamérica',
      contactName: 'Miguel Jahncke'
    });
  }

  // ============================================
  // VISTA PREVIA - HTML
  // ============================================
  getPreviewHtml(): string {
    return this.replaceVariables(this.config.htmlTemplate, {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@empresa.com',
      message: 'Me gustaría obtener más información sobre sus servicios...',
      region: 'Sudamérica',
      contactName: 'Miguel Jahncke',
      company: 'Acme Corp',
      phone: '+51 989 164 305'
    });
  }

  // ============================================
  // HELPER: Reemplazar variables
  // ============================================
  private replaceVariables(template: string, data: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, value || '');
    }
    return result;
  }
}