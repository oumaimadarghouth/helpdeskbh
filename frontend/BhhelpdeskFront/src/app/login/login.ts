import { Component } from '@angular/core';
import { AuthService } from '../core/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) { }


  onSubmit() {
    this.loading = true;
    this.error = '';

    this.auth.login(this.username, this.password).pipe(
      finalize(() => {
        this.loading = false; // 👈 garanti à 100%
      })
    ).subscribe({
      next: (res) => {
        try {
          this.auth.saveTokens(res.access, res.refresh);

          const payload = this.auth.decodeToken(res.access);
          console.log('JWT payload:', payload);

          const role = (payload?.role || 'USER').toUpperCase();
          const must = !!payload?.must_change_password;

          if (must && role !== 'ADMIN') {
            this.router.navigateByUrl('/force-change-password');
            return;
          }


          if (role === 'ADMIN') this.router.navigateByUrl('/users');
          else if (role === 'AGENT') this.router.navigateByUrl('/agent');
          else if (role === 'MANAGER') this.router.navigateByUrl('/helpdesk');
          else this.router.navigateByUrl('/');
        } catch (e) {
          console.error('POST-LOGIN CRASH:', e);
          this.error = 'Erreur après connexion (token)';
        }
      },
      error: (err) => {
        console.error('HTTP LOGIN ERROR:', err);
        this.error = err?.error?.detail || 'Login failed';
      }
    });
  }
}