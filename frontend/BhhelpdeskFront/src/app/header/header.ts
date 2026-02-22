import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthService, CurrentUser } from '../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {
  menuOpen = false;
  theme: 'light' | 'dark' = 'light';

  user$!: Observable<CurrentUser | null>;
  initials$!: Observable<string>;
  roleClass$!: Observable<string>;
  homeLink$!: Observable<string>;

  constructor(private auth: AuthService, private router: Router) {
    // ✅ 1) user$
    this.user$ = this.auth.currentUser$;

    // ✅ 2) initials$
    this.initials$ = this.user$.pipe(map(u => this.initialsFrom(u)));

    // ✅ 3) roleClass$
    this.roleClass$ = this.user$.pipe(map(u => this.roleClassFrom(u)));

    // ✅ 4) homeLink$
    this.homeLink$ = this.user$.pipe(map(u => {
      const role = (u?.role || 'USER').toUpperCase();
      if (role.includes('ADMIN')) return '/users';
      if (role.includes('AGENT')) return '/agent';
      if (role.includes('MANAGER')) return '/helpdesk';
      return '/';
    }));

    // ✅ debug
    this.user$.subscribe(u => console.log('HEADER currentUser =', u));
  }

  private initialsFrom(user: CurrentUser | null): string {
    const name = user?.fullName?.trim() || 'U';
    const parts = name.split(/\s+/).slice(0, 2);
    return parts.map(p => p[0]?.toUpperCase()).join('') || 'U';
  }

  private roleClassFrom(user: CurrentUser | null): string {
    const r = (user?.role || 'USER').toUpperCase();
    if (r.includes('ADMIN')) return 'is-admin';
    if (r.includes('AGENT')) return 'is-agent';
    return 'is-user';
  }

  toggleMenu() { this.menuOpen = !this.menuOpen; }
  closeMenu() { this.menuOpen = false; }

  toggleTheme() {
    const root = document.documentElement;
    root.classList.toggle('dark');
    this.theme = root.classList.contains('dark') ? 'dark' : 'light';
  }


  logout() {
    this.auth.logout();
    this.closeMenu();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click')
  onDocClick() {
    this.menuOpen = false;
  }
}
