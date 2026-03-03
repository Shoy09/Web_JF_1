// contact-messages-admin.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../api.config';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription, interval } from 'rxjs';

interface ContactMessage {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  region: string;
  contactName: string;
  toEmail: string;
  read: boolean;
  createdAt: Date;
}

interface Stats {
  total: number;
  unread: number;
  read: number;
}

type FilterType = 'all' | 'read' | 'unread';

@Component({
  selector: 'app-contact-messages-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './contactmes-sages.component.html',
  styleUrls: ['./contactmes-sages.component.css']
})
export class ContactMessagesAdminComponent implements OnInit, OnDestroy {

  messages: ContactMessage[] = [];
  filteredMessages: ContactMessage[] = [];
  stats: Stats | null = null;
  selectedFilter: FilterType = 'all';
  private refreshSubscription: Subscription | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadMessages();
    this.loadStats();
    
    // Actualizar cada 30 segundos
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadMessages();
      this.loadStats();
    });
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadMessages() {
    this.http.get<ContactMessage[]>(`${API_BASE_URL}/contact-messages`)
      .subscribe({
        next: (data) => {
          this.messages = data.map(msg => ({
            ...msg,
            createdAt: new Date(msg.createdAt)
          }));
          this.applyFilter();
        },
        error: (err) => console.error('Error al cargar mensajes:', err)
      });
  }

  loadStats() {
    this.http.get<Stats>(`${API_BASE_URL}/contact-messages/stats`)
      .subscribe({
        next: (data) => {
          this.stats = data;
        },
        error: (err) => console.error('Error al cargar estadísticas:', err)
      });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // FILTROS
  // ═══════════════════════════════════════════════════════════════════════

  filterMessages(filter: FilterType) {
    this.selectedFilter = filter;
    this.applyFilter();
  }

  private applyFilter() {
    switch (this.selectedFilter) {
      case 'read':
        this.filteredMessages = this.messages.filter(msg => msg.read);
        break;
      case 'unread':
        this.filteredMessages = this.messages.filter(msg => !msg.read);
        break;
      case 'all':
      default:
        this.filteredMessages = [...this.messages];
    }
  }

  toggleRead(id: number, currentRead: boolean) {
    const action = currentRead ? 'unread' : 'read';
    this.http.patch(`${API_BASE_URL}/contact-messages/${id}/${action}`, {})
      .subscribe({
        next: () => {
          this.loadMessages();
          this.loadStats();
        },
        error: (err) => console.error('Error al actualizar mensaje:', err)
      });
  }

  deleteMessage(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este mensaje?')) {
      this.http.delete(`${API_BASE_URL}/contact-messages/${id}`)
        .subscribe({
          next: () => {
            this.loadMessages();
            this.loadStats();
          },
          error: (err) => console.error('Error al eliminar mensaje:', err)
        });
    }
  }

}