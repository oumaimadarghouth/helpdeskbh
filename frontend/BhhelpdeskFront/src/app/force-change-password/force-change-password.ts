import { Component } from '@angular/core';
import { environment } from '../environments/environment';
import { AuthService } from '../core/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-force-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './force-change-password.html',
  styleUrl: './force-change-password.css',
})
export class ForceChangePassword {
  old_password = '';
  new_password = '';
  loading = false;
  msg = '';
  err = '';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router
  ) {}

  submit() {
    this.loading = true;
    this.msg = '';
    this.err = '';

    this.http
      .post(`${environment.apiBaseUrl}/auth/change-password/`, {
        old_password: this.old_password,
        new_password: this.new_password,
      })
      .subscribe({
        next: () => {
          this.msg = 'Mot de passe changé avec succès. Reconnexion...';
          this.auth.logout();
          // IMPORTANT: si ton Router te donne erreur "navigate",
          // utilise navigateByUrl (toujours dispo)
          this.router.navigateByUrl('/login');
        },
        error: (e) => {
          this.err = e?.error?.detail || 'Erreur changement mot de passe';
          this.loading = false;
        },
        complete: () => (this.loading = false),
      });
  }
}
