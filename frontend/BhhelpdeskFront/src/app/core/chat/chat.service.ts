import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type ChatResponse = {
  session_id: number;
  assistant_message: string;
  draft_ticket?: any;
  actions?: string[];
};

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private http: HttpClient) {}

  sendMessage(message: string, session_id?: number) {
    return this.http.post<ChatResponse>(`${environment.apiBaseUrl}/chat/`, { message, session_id });
  }
}
