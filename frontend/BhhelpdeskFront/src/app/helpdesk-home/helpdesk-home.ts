import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagerDiagnosticCard } from './manager-diagnostic-card.component';
import { DiagnosticService } from '../core/diagnostic/diagnostic.service';

@Component({
  selector: 'app-helpdesk-home',
  standalone: true,
  imports: [CommonModule, ManagerDiagnosticCard],
  templateUrl: './helpdesk-home.html',
  styleUrl: './helpdesk-home.css',
})
export class HelpdeskHome implements OnInit {
  diagnosticSessions: any[] = [];

  constructor(private diagnosticService: DiagnosticService) { }

  ngOnInit() {
    this.diagnosticService.listSessions().subscribe({
      next: (data) => {
        // On ne garde que les sessions qui ont du SQL généré (prêtes pour le manager)
        this.diagnosticSessions = data.filter(s => s.state === 'SQL_GENERATED' || s.state === 'EXECUTED');
      },
      error: (err) => console.error('Erreur sessions diagnostic', err)
    });
  }
}
