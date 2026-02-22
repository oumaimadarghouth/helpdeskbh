import { Component, OnInit } from '@angular/core';
import { PasswordResetAdminService, ResetRequest } from '../core/auth/password-reset-admin.Service';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-password-reset',
  imports: [CommonModule, DatePipe], // ✅ NgIf/NgFor + date pipe
  templateUrl: './admin-password-reset.html',
  styleUrl: './admin-password-reset.css',
})
export class AdminPasswordReset implements OnInit {
  items: ResetRequest[] = [];
  loading = false;
  err = '';
  msg = '';

  constructor(private api: PasswordResetAdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.err = '';
    this.msg = '';

    this.api.list().subscribe({
      next: (data) => (this.items = data),
      error: (e) => (this.err = e?.error?.detail || 'Erreur chargement'),
      complete: () => (this.loading = false),
    });
  }

  resend(item: ResetRequest) {
    this.err = '';
    this.msg = '';

    this.api.resend(item.id).subscribe({
      next: (res) => {
        this.msg = res?.detail || 'Lien renvoyé';
        item.status = 'SENT';
      },
      error: (e) => (this.err = e?.error?.detail || 'Erreur renvoi'),
    });
  }
}