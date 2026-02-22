import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminUser, AdminUsersService, CreateUserPayload } from '../core/auth/admin-user.service';
import { AuthService } from '../core/auth/auth.service';
import { filter, take } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsers implements OnInit {
  users: AdminUser[] = [];
  creating = false;
  loadingList = false;
  form: CreateUserPayload = {
    email: '',
    first_name: '',
    last_name: '',
    role: 'AGENT' as 'AGENT' | 'MANAGER',
  };

  filters = {
    q: '',
    role: '' as '' | 'AGENT' | 'MANAGER',
    is_active: '' as '' | 'true' | 'false',
  };

  msg = '';
  err = '';
  loading = false;

  constructor(private api: AdminUsersService, private auth: AuthService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.load();
  }



  load(retry = true) {
    this.loadingList = true;
    this.err = '';

    const params: any = {};
    if (this.filters.q) params.q = this.filters.q;
    if (this.filters.role) params.role = this.filters.role;
    if (this.filters.is_active !== '') params.is_active = this.filters.is_active === 'true';

    this.api.list(params).subscribe({
      next: (data) => {
        this.users = data;          // ✅ data est bien un tableau (ta capture le prouve)
        this.cdr.detectChanges();   // ✅ force update UI
      },
      error: (e) => {
        const status = e?.status;
        this.err = e?.error?.detail || 'Erreur chargement';

        if (retry && (status === 401 || status === 403)) {
          setTimeout(() => this.load(false), 200);
          return;
        }
      },
      complete: () => (this.loadingList = false),
    });
  }




  create() {
    if (this.creating) return; // évite double clic
    this.msg = '';
    this.err = '';
    this.creating = true;

    this.api.create(this.form).subscribe({
      next: () => {
        this.msg = 'Utilisateur créé';
        this.form = { email: '', first_name: '', last_name: '', role: 'AGENT' };
        this.load(); // recharge liste
      },
      error: (e) => {
        this.err = e?.error?.detail || JSON.stringify(e?.error) || 'Erreur création';
      },
      complete: () => (this.creating = false),
    });
  }


  toggle(u: AdminUser) {
    this.msg = '';
    this.err = '';
    this.loading = true;

    this.api.toggleActive(u.id, !u.is_active).subscribe({
      next: () => {
        u.is_active = !u.is_active;
        this.msg = 'Statut mis à jour';
      },
      error: (e) => (this.err = e?.error?.detail || 'Erreur update statut'),
      complete: () => (this.loading = false),
    });
  }

  deleteUser(u: AdminUser) {
    if (!confirm(`Voulez-vous vraiment supprimer ${u.first_name} ${u.last_name} ?`)) return;

    this.msg = '';
    this.err = '';
    this.loading = true;

    this.api.delete(u.id).subscribe({
      next: () => {
        this.msg = 'Utilisateur supprimé';
        this.users = this.users.filter((user) => user.id !== u.id);
        this.cdr.detectChanges();
      },
      error: (e) => (this.err = e?.error?.detail || 'Erreur suppression'),
      complete: () => (this.loading = false),
    });
  }
}
