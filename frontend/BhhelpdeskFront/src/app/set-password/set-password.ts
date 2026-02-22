import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './set-password.html',
  styleUrl: './set-password.css',
})
export class SetPassword implements OnInit {
  token = '';

  newPassword = '';
  confirmPassword = '';

  loading = false;
  msg = '';
  err = '';

  // ✅ mode lien expiré
  linkExpired = false;

  // ✅ email pour contacter l’admin (auto depuis token si possible)
  email = '';
  sentRequest = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.err = "Lien invalide : token manquant.";
      this.linkExpired = true;
      return;
    }

    // ✅ Vérifie le lien dès l’ouverture
  this.loading = true;
this.auth.verifySetPassword(this.token).subscribe({
  next: () => { this.linkExpired = false; },
  error: () => { this.linkExpired = true; this.err = "Lien expiré / invalide / déjà utilisé."; },
  complete: () => { this.loading = false; }
});

  }

  submit() {
    this.msg = '';
    this.err = '';

    if (!this.token) {
      this.err = "Lien invalide : token manquant.";
      return;
    }
    if (!this.newPassword || this.newPassword.length < 8) {
      this.err = 'Mot de passe : minimum 8 caractères.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.err = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.loading = true;

    this.auth.setPassword(this.token, this.newPassword).subscribe({
      next: (res) => {
        this.msg = res?.detail || 'Mot de passe défini avec succès.';
        this.auth.logout();
        setTimeout(() => this.router.navigateByUrl('/login'), 800);
      },
      error: (e) => {
        // si le backend dit expiré, on bascule mode expired
        const d = e?.error?.detail;
        this.err = d || 'Erreur: token invalide ou expiré.';
        this.linkExpired = true;
      },
      complete: () => (this.loading = false),
    });
  }

  // ✅ bouton "Contacter l’admin"
  requestNewLink() {
    this.msg = '';
    this.err = '';

    const email = (this.email || '').trim().toLowerCase();
    if (!email) {
      this.err = "Saisis ton email pour contacter l’admin.";
      return;
    }

    this.loading = true;
    this.auth.requestPasswordReset(email).subscribe({
      next: (res) => {
        this.sentRequest = true;
        this.msg = res?.detail || "Demande envoyée à l’administrateur.";
      },
      error: (e) => {
        this.err = e?.error?.detail || "Erreur lors de l’envoi de la demande.";
      },
      complete: () => (this.loading = false),
    });
  }
}