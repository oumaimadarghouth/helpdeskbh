import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type UserProfile = {
  phone: string | null;
  department: string | null;
  contract_type: string | null;
};

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private http: HttpClient) {}

  getMyProfile() {
    return this.http.get<UserProfile>(`${environment.apiBaseUrl}/me/profile/`);
  }

  updateMyProfile(payload: Partial<UserProfile>) {
    return this.http.patch<UserProfile>(`${environment.apiBaseUrl}/me/profile/`, payload);
  }
}
