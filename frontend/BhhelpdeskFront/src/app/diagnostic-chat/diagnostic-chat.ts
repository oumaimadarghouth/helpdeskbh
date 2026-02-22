import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiagnosticService } from '../core/diagnostic/diagnostic.service';
import { DiagnosticMessage } from '../core/diagnostic/diagnostic.model';

@Component({
    selector: 'app-diagnostic-chat',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="diagnostic-container">
      <div class="chat-header">
        <h3>Assistant Diagnostic IA - Salim</h3>
      </div>
      
      <div class="chat-messages" #scrollMe>
        <div *ngFor="let msg of messages" [ngClass]="['message', msg.role]">
          <div class="message-content">
            <p>{{ msg.content }}</p>
          </div>
        </div>
        <div *ngIf="loading" class="message assistant loading">
          <span>L'IA analyse le problème...</span>
        </div>
      </div>

      <div class="chat-input">
        <input 
          [(ngModel)]="userInput" 
          (keyup.enter)="sendMessage()" 
          placeholder="Décrivez votre problème de données..."
          [disabled]="loading"
        >
        <button (click)="sendMessage()" [disabled]="loading || !userInput.trim()">Envoyer</button>
      </div>
    </div>
  `,
    styles: [`
    .diagnostic-container { display: flex; flex-direction: column; height: 500px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
    .chat-header { background: #004a99; color: white; padding: 15px; }
    .chat-messages { flex: 1; overflow-y: auto; padding: 15px; background: #f9f9f9; }
    .message { margin-bottom: 15px; display: flex; }
    .message.user { justify-content: flex-end; }
    .message-content { max-width: 80%; padding: 10px; border-radius: 10px; }
    .user .message-content { background: #004a99; color: white; }
    .assistant .message-content { background: #eee; color: #333; }
    .chat-input { display: flex; padding: 10px; border-top: 1px solid #ddd; }
    .chat-input input { flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
    .chat-input button { margin-left: 10px; padding: 10px 20px; background: #004a99; color: white; border: none; border-radius: 4px; cursor: pointer; }
  `]
})
export class DiagnosticChat implements OnInit {
    @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

    messages: DiagnosticMessage[] = [
        { role: 'assistant', content: 'Bonjour Agent. Comment puis-je vous aider avec la base de données Salim aujourd\'hui ?' }
    ];
    userInput: string = '';
    loading: boolean = false;
    sessionId?: number;

    constructor(private diagnosticService: DiagnosticService) { }

    ngOnInit() { }

    sendMessage() {
        if (!this.userInput.trim() || this.loading) return;

        const userMsg = this.userInput.trim();
        this.messages.push({ role: 'user', content: userMsg });
        this.userInput = '';
        this.loading = true;
        this.scrollToBottom();

        this.diagnosticService.sendDiagnosticMessage(userMsg, this.sessionId)
            .subscribe({
                next: (res) => {
                    this.messages.push({ role: 'assistant', content: res.message });
                    this.sessionId = res.session_id;
                    this.loading = false;
                    this.scrollToBottom();
                },
                error: (err) => {
                    this.messages.push({ role: 'system', content: 'Erreur: Impossible de contacter l\'IA.' });
                    this.loading = false;
                    this.scrollToBottom();
                }
            });
    }

    private scrollToBottom(): void {
        setTimeout(() => {
            try {
                this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
            } catch (err) { }
        }, 100);
    }
}
