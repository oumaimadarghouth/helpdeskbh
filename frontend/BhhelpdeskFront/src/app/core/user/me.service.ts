import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type Me = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'ADMIN' | 'AGENT' | 'MANAGER' | null;
  must_change_password: boolean;
  is_active: boolean;
  last_login: string | null;
  date_joined: string;
};

@Injectable({ providedIn: 'root' })
export class MeService {
  constructor(private http: HttpClient) {}

  getMe() {
    return this.http.get<Me>(`${environment.apiBaseUrl}/me/`);
  }
    // ✅ AJOUT ICI
  updateMe(payload: Partial<Pick<Me, 'email' | 'first_name' | 'last_name'>>) {
    return this.http.patch<Me>(`${environment.apiBaseUrl}/me/`, payload);
  }
}
