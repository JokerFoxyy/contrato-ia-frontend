import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'documents/new',
    loadComponent: () =>
      import('./features/documents/document-create/document-create.component').then(
        m => m.DocumentCreateComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'documents/:id',
    loadComponent: () =>
      import('./features/documents/document-result/document-result.component').then(
        m => m.DocumentResultComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'documents',
    loadComponent: () =>
      import('./features/documents/document-list/document-list.component').then(
        m => m.DocumentListComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
