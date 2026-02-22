import { Component, Inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  role: string = 'USER';

  kpis = {
    ticketsResolved: 128,
    deltaResolved: 12,
    sla: 93,
    slaTarget: 95,
    aiAccuracy: 89,
    avgResolutionHours: 6.4,
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.auth.currentUser$.subscribe(user => {
      if (user) {
        this.role = user.role;
        // Redirection automatique vers le dashboard
        this.redirectByRole(user.role);
      }
    });
  }

  private redirectByRole(role: string) {
    const r = role.toUpperCase();
    if (r.includes('ADMIN')) this.router.navigate(['/users']);
    else if (r.includes('AGENT')) this.router.navigate(['/agent']);
    else if (r.includes('MANAGER')) this.router.navigate(['/helpdesk']);
  }
}
