import { Component } from '@angular/core';
import { DiagnosticChat } from '../diagnostic-chat/diagnostic-chat';

@Component({
  standalone: true,
  selector: 'app-agent-home',
  imports: [DiagnosticChat],
  templateUrl: './agent-home.html',
  styleUrl: './agent-home.css',
})
export class AgentHome {

}
