import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

canActivate() {
  console.log('AuthGuard isLoggedIn=', this.auth.isLoggedIn(), 'token=', this.auth.accessToken);
  return this.auth.isLoggedIn() ? true : this.router.parseUrl('/login');
}


}
