import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { ForceChangePassword } from './force-change-password/force-change-password';
import { AuthGuard } from './core/auth/auth.guards';
import { ForcePasswordGuard } from './core/auth/force-password.guard';
import { RoleGuard } from './core/auth/role.guard';
import { AdminUsers } from './admin-users/admin-users';
import { LoginGuard } from './core/auth/login.guard';
import { AdminPasswordResetRequests } from './admin-password-reset-requests/admin-password-reset-requests';
import { ProfileComponent } from './profile/profile';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },

  // ✅ login bloqué si déjà connecté
  { path: 'login', canActivate: [LoginGuard], loadComponent: () => import('./login/login').then(m => m.Login) },

  // ✅ lien public email
  { path: 'set-password', loadComponent: () => import('./set-password/set-password').then(m => m.SetPassword) },

  // ✅ accessible si connecté
  { path: 'force-change-password', component: ForceChangePassword, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent },

  // ✅ routes privées
  {
    path: '',
    canActivate: [ForcePasswordGuard],
    children: [
      {
        path: 'admin',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./admin-home/admin-home').then(m => m.AdminHome),
      },
      {
        path: 'users',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./admin-users/admin-users').then(m => m.AdminUsers),
      },
      {
        path: 'agent',
        canActivate: [RoleGuard],
        data: { roles: ['AGENT'] },
        loadComponent: () => import('./agent-home/agent-home').then(m => m.AgentHome),
      },
      {
        path: 'helpdesk',
        canActivate: [RoleGuard],
        data: { roles: ['MANAGER'] },
        loadComponent: () => import('./helpdesk-home/helpdesk-home').then(m => m.HelpdeskHome),
      },

      // ✅ route racine privée -> rediriger selon rôle
      { path: '', redirectTo: 'users', pathMatch: 'full' },
    ],
  },
  {
    path: 'password-reset-requests',
    component: AdminPasswordResetRequests,
  },
  { path: '**', redirectTo: '' },
];
