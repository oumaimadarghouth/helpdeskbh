import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type ResetRequest = {
  id: number;
  email: string;
  status: 'OPEN' | 'SENT';
  created_at: string;
};

@Injectable({ providedIn: 'root' })
export class PasswordResetAdminService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<ResetRequest[]>(
      `${environment.apiBaseUrl}/auth/admin/password-reset/`
    );
  }

  resend(request_id: number) {
    return this.http.post<{ detail: string }>(
      `${environment.apiBaseUrl}/auth/admin/password-reset/resend/`,
      { request_id }
    );
  }
}
