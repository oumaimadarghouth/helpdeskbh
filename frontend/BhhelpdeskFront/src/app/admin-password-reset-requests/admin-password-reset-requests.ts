import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PasswordResetAdminService, ResetRequest } from '../core/auth/password-reset-admin.Service';

@Component({
  selector: 'app-admin-password-reset-requests',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './admin-password-reset-requests.html',
  styleUrl: './admin-password-reset-requests.css',
})
export class AdminPasswordResetRequests {
  loading = true;
  err = '';
  items: ResetRequest[] = [];

  constructor(private svc: PasswordResetAdminService) {
    this.load();
  }

  load() {
    this.loading = true;
    this.err = '';

    this.svc.list().subscribe({
      next: (data) => {
        this.items = data || [];
      },
      error: (e) => {
        this.err = e?.error?.detail || 'Erreur chargement des demandes';
        this.items = [];
      },
      complete: () => (this.loading = false),
    });
  }

  resend(id: number) {
    this.svc.resend(id).subscribe({
      next: () => this.load(),
      error: (e) => {
        alert(e?.error?.detail || 'Erreur renvoi du lien');
      },
    });
  }

}
