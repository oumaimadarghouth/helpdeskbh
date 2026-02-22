import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagnosticService } from '../core/diagnostic/diagnostic.service';

@Component({
    selector: 'app-manager-diagnostic-card',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="diagnostic-card" *ngIf="session">
      <div class="card-header">
        <span class="badge">DIAGNOSTIC AI</span>
        <h4>Ticket #{{ session.ticket }}</h4>
      </div>
      
      <div class="card-body">
        <p><strong>Agent:</strong> {{ session.agent_name || 'Chargement...' }}</p>
        <p><strong>Problème:</strong> {{ session.problem_description }}</p>
        
        <div class="sql-box" *ngIf="session.sql_queries.length > 0">
          <h6>Requête Corrective Proposée:</h6>
          <pre><code>{{ session.sql_queries[0].sql_query }}</code></pre>
          <p class="explanation"><em>Explication:</em> {{ session.sql_queries[0].explanation }}</p>
        </div>

        <div class="actions" *ngIf="!session.sql_queries[0].executed_at">
          <button class="btn-execute" (click)="execute(session.sql_queries[0].id)" [disabled]="loading">
            {{ loading ? 'Exécution...' : 'Valider & Exécuter' }}
          </button>
        </div>
        
        <div class="success-message" *ngIf="session.sql_queries[0].executed_at">
          ✅ Exécuté le {{ session.sql_queries[0].executed_at | date:'short' }}
        </div>
      </div>
    </div>
  `,
    styles: [`
    .diagnostic-card { border: 1px solid #ffcc00; background: #fffdf5; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .card-header { background: #ffcc00; padding: 10px; display: flex; align-items: center; }
    .badge { background: #333; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; margin-right: 10px; }
    .card-body { padding: 15px; }
    .sql-box { background: #2d2d2d; color: #76ff03; padding: 12px; border-radius: 6px; margin: 10px 0; font-family: 'Courier New', Courier, monospace; }
    .sql-box h6 { color: #aaa; margin-bottom: 5px; }
    .explanation { font-size: 0.9em; color: #555; }
    .btn-execute { background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; }
    .btn-execute:hover { background: #218838; }
    .btn-execute:disabled { background: #ccc; cursor: not-allowed; }
    .success-message { color: #28a745; font-weight: bold; margin-top: 10px; }
  `]
})
export class ManagerDiagnosticCard {
    @Input() session: any;
    loading: boolean = false;

    constructor(private diagnosticService: DiagnosticService) { }

    execute(queryId: number) {
        if (!confirm('Voulez-vous vraiment exécuter cette requête corrective ?')) return;

        this.loading = true;
        this.diagnosticService.executeSQL(queryId).subscribe({
            next: (res) => {
                alert('Requête exécutée avec succès !');
                this.session.sql_queries[0].executed_at = new Date().toISOString();
                this.loading = false;
            },
            error: (err) => {
                alert('Erreur lors de l\'exécution : ' + err.error?.error);
                this.loading = false;
            }
        });
    }
}
