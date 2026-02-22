import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { filter, take, BehaviorSubject } from 'rxjs';

export type UserRole = 'ADMIN' | 'AGENT' | 'MANAGER';

export type AdminUser = {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  must_change_password: boolean;
};

export type CreateUserPayload = {
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'AGENT' | 'MANAGER';
};

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private usersSubject = new BehaviorSubject<AdminUser[]>([]);
  users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient, private auth: AuthService) {
    // Load the users once when an access token is available
    this.auth.accessToken$
      .pipe(
        filter((t) => !!t), // attendre token
        take(1) // une seule fois
      )
      .subscribe(() => this.load());
  }

  load(params?: { role?: 'AGENT' | 'MANAGER'; is_active?: boolean; q?: string }) {
    this.list(params).subscribe({
      next: (data) => this.usersSubject.next(data),
      error: () => this.usersSubject.next([]),
    });
  }

  list(params?: { role?: 'AGENT' | 'MANAGER'; is_active?: boolean; q?: string }) {
    const url = `${environment.apiBaseUrl}/admin/users/`;
    return this.http.get<AdminUser[]>(url, { params: params as any });
  }

  create(payload: CreateUserPayload) {
    return this.http.post<any>(`${environment.apiBaseUrl}/admin/users/`, payload);
  }

  toggleActive(userId: number, is_active: boolean) {
    return this.http.patch<any>(
      `${environment.apiBaseUrl}/admin/users/${userId}/active/`,
      { is_active }
    );
  }

  delete(id: number) {
    return this.http.delete(`${environment.apiBaseUrl}/admin/users/${id}/`);
  }
}
