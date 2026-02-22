import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!this.auth.isLoggedIn()) {
      return this.router.parseUrl('/login');
    }

    const allowed = route.data['roles'] as Array<'ADMIN' | 'AGENT' | 'MANAGER'> | undefined;
    if (!allowed || allowed.length === 0) return true;

    if (this.auth.hasRole(allowed)) return true;

    return this.router.parseUrl('/forbidden');
  }
}
