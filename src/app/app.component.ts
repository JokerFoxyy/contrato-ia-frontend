import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { KeycloakService } from './core/auth/keycloak.service';
import { ThemeService } from './core/services/theme.service';

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
        MatTooltipModule,
    ],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <!-- Navbar -->
      <mat-toolbar class="!bg-white dark:!bg-slate-800 !shadow-sm !sticky !top-0 !z-50 !border-b !border-slate-200 dark:!border-slate-700 transition-colors duration-200">
        <div class="page-container w-full flex items-center justify-between">
          <a routerLink="/dashboard" class="flex items-center gap-2 no-underline">
            <mat-icon class="!text-blue-600 dark:!text-blue-400">description</mat-icon>
            <span class="text-lg font-bold text-slate-800 dark:text-slate-100">ContratoIA</span>
          </a>

          <nav class="hidden md:flex items-center gap-1">
            <a mat-button routerLink="/dashboard" routerLinkActive="!text-blue-600 dark:!text-blue-400"
               class="dark:!text-slate-300">
              Dashboard
            </a>
            <a mat-button routerLink="/documents" routerLinkActive="!text-blue-600 dark:!text-blue-400"
               class="dark:!text-slate-300">
              Meus Documentos
            </a>
            <a mat-button routerLink="/documents/new" routerLinkActive="!text-blue-600 dark:!text-blue-400"
               class="dark:!text-slate-300">
              Novo Contrato
            </a>
          </nav>

          <div class="flex items-center gap-1">
            <!-- Dark mode toggle -->
            <button mat-icon-button (click)="toggleTheme()"
                    [matTooltip]="isDark() ? 'Modo claro' : 'Modo escuro'"
                    class="dark:!text-slate-300">
              <mat-icon>{{ isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>

            @if (isAuthenticated) {
              <button mat-icon-button [matMenuTriggerFor]="userMenu" class="dark:!text-slate-300">
                <mat-icon>account_circle</mat-icon>
              </button>
              <mat-menu #userMenu="matMenu">
                <div class="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                  <p class="font-medium text-sm text-slate-800 dark:text-slate-200">{{ userProfile.name }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">{{ userProfile.email }}</p>
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

      <!-- Conteudo -->
      <main>
        <router-outlet />
      </main>
    </div>
  `
})
export class AppComponent {
  private keycloak = inject(KeycloakService);
  private themeService = inject(ThemeService);

  get isAuthenticated(): boolean {
    return this.keycloak.isAuthenticated();
  }

  get userProfile() {
    return this.keycloak.getUserProfile();
  }

  isDark(): boolean {
    return this.themeService.theme() === 'dark';
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  login(): void {
    this.keycloak.login();
  }

  logout(): void {
    this.keycloak.logout();
  }
}
