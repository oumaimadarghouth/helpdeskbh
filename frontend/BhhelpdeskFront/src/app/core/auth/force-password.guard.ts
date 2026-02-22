import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ForcePasswordGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (!this.auth.isLoggedIn()) {
      return this.router.parseUrl('/login');
    }

    const role = this.auth.role();
if (this.auth.mustChangePassword() && role !== 'ADMIN') {
  return this.router.parseUrl('/force-change-password');
}


    return true;
  }
}
