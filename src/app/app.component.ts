import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { KeycloakService } from './core/auth/keycloak.service';

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
    ],
    template: `
    <div class="min-h-screen bg-slate-50">
      <!-- Navbar -->
      <mat-toolbar class="!bg-white !shadow-sm !sticky !top-0 !z-50">
        <div class="page-container w-full flex items-center justify-between">
          <a routerLink="/dashboard" class="flex items-center gap-2 no-underline">
            <mat-icon class="!text-blue-600">description</mat-icon>
            <span class="text-lg font-bold text-slate-800">ContratoIA</span>
          </a>

          <nav class="hidden md:flex items-center gap-1">
            <a mat-button routerLink="/dashboard" routerLinkActive="!text-blue-600">
              Dashboard
            </a>
            <a mat-button routerLink="/documents" routerLinkActive="!text-blue-600">
              Meus Documentos
            </a>
            <a mat-button routerLink="/documents/new" routerLinkActive="!text-blue-600">
              Novo Contrato
            </a>
          </nav>

          <div class="flex items-center gap-2">
            @if (isAuthenticated) {
              <button mat-icon-button [matMenuTriggerFor]="userMenu">
                <mat-icon>account_circle</mat-icon>
              </button>
              <mat-menu #userMenu="matMenu">
                <div class="px-4 py-2 border-b border-slate-100">
                  <p class="font-medium text-sm text-slate-800">{{ userProfile.name }}</p>
                  <p class="text-xs text-slate-500">{{ userProfile.email }}</p>
                </div>
                <button mat-menu-item (click)="logout()">
                  <mat-icon>logout</mat-icon>
                  <span>Sair</span>
                </button>
              </mat-menu>
            } @else {
              <button mat-flat-button color="primary" (click)="login()">
                Entrar
              </button>
            }
          </div>
        </div>
      </mat-toolbar>

      <!-- Conteúdo -->
      <main>
        <router-outlet />
      </main>
    </div>
  `
})
export class AppComponent {
  private keycloak = inject(KeycloakService);

  get isAuthenticated(): boolean {
    return this.keycloak.isAuthenticated();
  }

  get userProfile() {
    return this.keycloak.getUserProfile();
  }

  login(): void {
    this.keycloak.login();
  }

  logout(): void {
    this.keycloak.logout();
  }
}
