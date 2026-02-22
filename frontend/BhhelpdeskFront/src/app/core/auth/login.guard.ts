import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }

  canActivate(): boolean | UrlTree {
    if (!this.auth.isLoggedIn()) return true;

    // ✅ déjà connecté → rediriger selon rôle
    const role = this.auth.role();
    if (role === 'ADMIN') return this.router.parseUrl('/users');
    if (role === 'AGENT') return this.router.parseUrl('/agent');
    if (role === 'MANAGER') return this.router.parseUrl('/helpdesk');
    return this.router.parseUrl('/');
  }
}
