import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../core/chat/chat.service';
import { finalize } from 'rxjs/operators';

type Msg = { role: 'user' | 'assistant'; content: string };

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.css',
})
export class ChatWidget {
  text = '';
  loading = false;
  sessionId?: number;
  messages: Msg[] = [{ role: 'assistant', content: 'Bonjour. Décris ton problème et je crée un ticket.' }];

  constructor(private chat: ChatService) {}

  send() {
    const msg = this.text.trim();
    if (!msg) return;
    this.messages.push({ role: 'user', content: msg });
    this.text = '';
    this.loading = true;

    this.chat.sendMessage(msg, this.sessionId).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (res) => {
        this.sessionId = res.session_id;
        this.messages.push({ role: 'assistant', content: res.assistant_message });
      },
      error: (e) => {
        this.messages.push({ role: 'assistant', content: 'Erreur serveur. Réessaie.' });
        console.error(e);
      }
    });
  }
}