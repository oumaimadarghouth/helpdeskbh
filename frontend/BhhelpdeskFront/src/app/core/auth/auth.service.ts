import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject } from 'rxjs';

export type Role = 'ADMIN' | 'AGENT' | 'MANAGER' | 'USER';

export type CurrentUser = {
  fullName: string;
  role: Role;
  email?: string;
};

type JwtPayload = {
  role?: 'ADMIN' | 'AGENT' | 'MANAGER';
  full_name?: string;
  fullName?: string;
  email?: string;
  must_change_password?: boolean;
  exp?: number;
};

type LoginResponse = { access: string; refresh: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private ACCESS_KEY = 'access_token';
  private REFRESH_KEY = 'refresh_token';

  private accessTokenSubject = new BehaviorSubject<string | null>(null);
  accessToken$ = this.accessTokenSubject.asObservable();
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private readySubject = new BehaviorSubject<boolean>(false);
  ready$ = this.readySubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    const token = this.accessToken;

    this.accessTokenSubject.next(token);
    this.currentUserSubject.next(this.userFromToken(token));

    // ✅ pas de token → auth prête (invité)
    if (!token) {
      this.readySubject.next(true);
      return;
    }

    // ✅ token valide → hydrate, puis ready=true
    if (this.isLoggedIn()) {
      this.hydrateUser(() => this.readySubject.next(true));
      return;
    }

    // ✅ token expiré → tente refresh, puis hydrate, puis ready=true
    const r = this.refreshToken;
    if (!r) {
      this.logout();
      this.readySubject.next(true);
      return;
    }

    this.refresh().subscribe({
      next: (res) => {
        localStorage.setItem(this.ACCESS_KEY, res.access);
        this.accessTokenSubject.next(res.access);
        this.currentUserSubject.next(this.userFromToken(res.access));

        this.hydrateUser(() => this.readySubject.next(true));
      },
      error: () => {
        this.logout();
        this.readySubject.next(true);
      },
    });
  }




  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
  private userFromToken(token: string | null): CurrentUser | null {
    if (!token) return null;

    const p = this.decodeToken(token);
    if (!p) return null;

    // rôle direct depuis le token
    const role = p.role || 'USER';

    return {
      fullName: p.full_name || p.fullName || 'Utilisateur',
      role: role as Role,
      email: p.email,
    };
  }

  login(username: string, password: string) {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login/`, {
      username,
      password,
    });
  }

  saveTokens(access: string, refresh: string) {
    if (!this.isBrowser) return;

    localStorage.setItem(this.ACCESS_KEY, access);
    localStorage.setItem(this.REFRESH_KEY, refresh);

    this.accessTokenSubject.next(access);

    // fallback immédiat depuis token (role)
    this.currentUserSubject.next(this.userFromToken(access));

    // ✅ récupère vrai nom + rôle depuis backend
    this.hydrateUser(() => this.readySubject.next(true));
  }





  get accessToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.ACCESS_KEY);
  }

  get refreshToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.REFRESH_KEY);
  }

  logout() {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.ACCESS_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    this.accessTokenSubject.next(null);

    // ✅ vide le user
    this.currentUserSubject.next(null);
  }


  decodeToken(token: string): JwtPayload | null {
    try {
      if (!token || token.split('.').length !== 3) return null;
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  decode(): JwtPayload | null {
    const token = this.accessToken;
    return token ? this.decodeToken(token) : null;
  }

  isLoggedIn(): boolean {
    const p = this.decode();
    if (!p?.exp) return !!this.accessToken;
    return p.exp > Math.floor(Date.now() / 1000);
  }

  role(): JwtPayload['role'] {
    return this.decode()?.role?.toUpperCase() as any;
  }

  mustChangePassword(): boolean {
    return !!this.decode()?.must_change_password;
  }

  hasRole(roles: Array<'ADMIN' | 'AGENT' | 'MANAGER'>): boolean {
    const r = this.role();
    return !!r && roles.includes(r);
  }

  setPassword(token: string, new_password: string) {
    return this.http.post<{ detail: string }>(
      `${environment.apiBaseUrl}/auth/set-password/`,
      { token, new_password }
    );
  }


  me() {
    return this.http.get<any>(`${environment.apiBaseUrl}/auth/me/`);
  }
  refresh() {
    return this.http.post<{ access: string }>(
      `${environment.apiBaseUrl}/auth/refresh/`,
      { refresh: this.refreshToken }
    );
  }

  private hydrateUser(done?: () => void) {
    // si pas de token → user null
    if (!this.accessToken) {
      this.currentUserSubject.next(null);
      done?.();
      return;
    }

    // access expiré → refresh puis retry
    if (!this.isLoggedIn()) {
      const r = this.refreshToken;
      if (!r) {
        this.logout();
        done?.();
        return;
      }

      this.refresh().subscribe({
        next: (res) => {
          localStorage.setItem(this.ACCESS_KEY, res.access);
          this.accessTokenSubject.next(res.access);
          this.currentUserSubject.next(this.userFromToken(res.access));
          this.hydrateUser(done); // retry
        },
        error: () => {
          this.logout();
          done?.();
        },
      });
      return;
    }

    this.me().subscribe({
      next: (u) => {
        const fullName =
          (u.first_name || u.last_name)
            ? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim()
            : (u.username ?? 'Utilisateur');

        const role = (u.role || 'USER').toUpperCase();

        this.currentUserSubject.next({
          fullName,
          role: role as Role,
          email: u.email,
        });
      },
      error: (e) => {
        console.error('ME ERROR:', e);
        this.currentUserSubject.next(this.userFromToken(this.accessToken));
      },
      complete: () => done?.(), // ✅ important
    });
  }
  verifySetPassword(token: string) {
    return this.http.post<{ detail: string }>(
      `${environment.apiBaseUrl}/auth/verify-set-password/`,
      { token }
    );
  }

  requestPasswordReset(email: string) {
    return this.http.post<{ detail: string }>(
      `${environment.apiBaseUrl}/auth/password-reset/`,
      { email }
    );
  }

}
