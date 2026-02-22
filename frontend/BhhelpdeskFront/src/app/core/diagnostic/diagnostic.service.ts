import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DiagnosticChatResponse, DiagnosticSession } from './diagnostic.model';

@Injectable({
    providedIn: 'root'
})
export class DiagnosticService {
    private apiUrl = `${environment.apiBaseUrl}/diagnostic`;

    constructor(private http: HttpClient) { }

    sendDiagnosticMessage(message: string, sessionId?: number): Observable<DiagnosticChatResponse> {
        return this.http.post<DiagnosticChatResponse>(`${this.apiUrl}/chat/`, {
            message,
            session_id: sessionId
        });
    }

    executeSQL(queryId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/execute/${queryId}/`, {});
    }

    listSessions(): Observable<DiagnosticSession[]> {
        return this.http.get<DiagnosticSession[]>(`${this.apiUrl}/chat/`);
    }

    getSession(sessionId: number): Observable<DiagnosticSession> {
        return this.http.get<DiagnosticSession>(`${this.apiUrl}/session/${sessionId}/`);
    }
}
